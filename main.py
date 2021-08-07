from flask import Flask, request, send_file, send_from_directory, render_template, jsonify
import subprocess as sp
import os
import io
import string
import secrets


app = Flask(__name__, static_folder="static")

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/compile', methods=['GET', 'POST'])
def compile():
	# Get input code file, return compiled .wasm file
	if request.method == 'POST':	
		# Create directory	
		alphabet = string.ascii_letters + string.digits
		directory = ''.join(secrets.choice(alphabet) for i in range(8))
		os.mkdir(os.path.join('tempData', directory))
		
		# Save file in new directory
		f = request.files['file']
		file_path = os.path.join('tempData', directory, f.filename)
		# print(file_path)
		f.save(file_path)
		
		# build the command to compile the source file to WebAssembly
		command = build_compile_script(os.path.join('tempData', directory, f.filename), os.path.join('tempData', directory)).split()
		# print(command)

		# compile to WebAssembly
		if os.name == "nt":	# If machine is run on Windows 10
			compile_log = sp.run(command, capture_output=True, text=True, shell=True)
		else:
			compile_log = sp.run(command, capture_output=True, text=True)

		# send stdout & stderr to text file
		if compile_log.returncode != 0:
			returnObject = {}
			if compile_log.stdout:
				returnObject['warning'] = compile_log.stdout

			if compile_log.stderr:
				returnObject['error'] = compile_log.stderr
		

			sp.run(['rm', '-rf', directory])
			return jsonify(returnObject), 200, {'ContentType':'application/json'} 	 

		return jsonify({'wrkdir':directory}), 200, {'ContentType':'application/json'} 		


def build_compile_script(filename, directory):
	# if it's a C/C++ file
	if filename.split('.')[1] == 'cpp': 
		return c_cpp_compile(filename, directory)

	# otherwise compile as Rust
	else:
		return rust_compile(filename)


def c_cpp_compile(filename, directory):
	rename, s_flags, template = '', '', ''
	s_flags += ' -s EXIT_RUNTIME=1 '
	s_flags += ' -s ENVIRONMENT=web '
	s_flags += ' -s FILESYSTEM=1 '
	s_flags += ' -s EXPORTED_FUNCTIONS=["_main"] '
	rename += f' -o {directory}/output.js '
	#template += ' --shell-file ./templates/emscripten_template.html'

	return f'emcc {filename} {s_flags} {rename} {template}'


def rust_compile(filename):
	pass
	
# Send WASM to client upon request in JS
@app.route('/file/<directory>', methods=['GET'])
def getWASM(directory):	


	return_data = io.BytesIO()
	with open('./' + 'tempData/' + directory + '/output.wasm', 'rb') as fo:
		return_data.write(fo.read())
		return_data.seek(0)

	sp.run(['rm', '-rf', directory])
	# os.remove(directory)

	return send_file(return_data, mimetype='application/wasm', attachment_filename='output.wasm')
	#return send_file(app.root_path, filename=f'./{directory}/output.wasm', as_attachment=False)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)