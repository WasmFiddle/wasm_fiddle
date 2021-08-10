from flask import Flask, request, send_file, send_from_directory, render_template, jsonify
import subprocess as sp
import os
import io
import string
import secrets

app = Flask(__name__, static_folder="static")

# Home page, returns index
@app.route('/')
def index():
	return render_template('index.html')

# Accepts a C/C++ file and returns location of WASM on server
@app.route('/compile', methods=['POST'])
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

		# Send stdout & stderr to text file and as object to client
		if compile_log.returncode != 0:
			returnObject = {}
			if compile_log.stdout:
				returnObject['warning'] = compile_log.stdout

			if compile_log.stderr:
				returnObject['error'] = compile_log.stderr
		
			sp.run(['rm', '-rf', os.path.join('tempData', directory)])
			return jsonify(returnObject), 200, {'ContentType':'application/json'} 	 
			
		# Returns the name of the newly created directory to access WASM file
		return jsonify({'wrkdir':directory}), 200, {'ContentType':'application/json'} 		

# Accepts the name of the file and the location of directory, returns completed command
# based on if Cpp or Rust
def build_compile_script(filename, directory):
	# if it's a C/C++ file
	if filename.split('.')[1] == 'cpp': 
		return c_cpp_compile(filename, directory)

	# otherwise compile as Rust
	else:
		return rust_compile(filename)

# Accepts the name of the file and the location of directory, returns completed C++ command 
def c_cpp_compile(filename, directory):
	rename, s_flags, template = '', '', ''
	s_flags += ' -s EXIT_RUNTIME=1 '
	s_flags += ' -s ENVIRONMENT=web '
	s_flags += ' -s FILESYSTEM=1 '
	s_flags += ' -s EXPORTED_FUNCTIONS=["_main"] '
	rename += f' -o {directory}/output.js '
	#template += ' --shell-file ./templates/emscripten_template.html'

	return f'emcc {filename} {s_flags} {rename} {template}'

# Rust not yet implemented
def rust_compile(filename):
	pass
	
# Return WASM to client
@app.route('/file/<directory>', methods=['GET'])
def getWASM(directory):	

	return_data = io.BytesIO()
	with open('./' + 'tempData/' + directory + '/output.wasm', 'rb') as fo:
		return_data.write(fo.read())
		return_data.seek(0)

	sp.run(['rm', '-rf', os.path.join('tempData', directory)])

	return send_file(return_data, mimetype='application/wasm', attachment_filename='output.wasm')

# Favicon support
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

# LocalHost development
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)