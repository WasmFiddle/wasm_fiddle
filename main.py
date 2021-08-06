from flask import Flask, request, send_from_directory, render_template, jsonify, after_this_request
import subprocess as sp
import os
from datetime import datetime

app = Flask(__name__, static_folder="static")

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/compile', methods=['GET', 'POST'])
def compile():
	# Get input code file, return compiled .wasm file
	if request.method == 'POST':	
		# Create directory
		now = datetime.now()
		current_time = now.strftime("%H%M%S")
		os.mkdir(current_time)
		
		# Save file in new directory
		f = request.files['file']
		file_path = os.path.join(current_time, f.filename)
		print(file_path)
		f.save(file_path)

		# # ensure a past files aren't served
		# for file_type in ['html', 'txt', 'js', 'wasm']:
			# # if file_type == 'html':
				# # os.system(f'echo > templates/output.{file_type}')
			# # else:
			# os.system(f'echo > output.{file_type}')

		
		# build the command to compile the source file to WebAssembly
		command = build_compile_script(os.path.join(current_time, f.filename), current_time).split()
		print(command)

		# compile to WebAssembly
		if os.name == "nt":	# If machine is run on Windows 10
			compile_log = sp.run(command, capture_output=True, text=True, shell=True)
		else:
			compile_log = sp.run(command, capture_output=True, text=True)

		# send stdout & stderr to text file
		with open('output.txt', 'a') as outfile:
			if compile_log.stdout:
				outfile.write(compile_log.stdout)

			if compile_log.stderr:
				outfile.write(compile_log.stderr)


		return jsonify({'wrkdir':current_time}), 200, {'ContentType':'application/json'} 
		
		# # Send the HTML file to the client
		# try:
			# # move new files to root directory
			# sp.run(['cp' ,f'./{current_time}/output.html', f'./{current_time}/output.js', f'./{current_time}/output.wasm', app.root_path ])
			# # sp.run(['cp' ,f'./{current_time}/output.js', f'./{current_time}/output.wasm', app.root_path ])
			# # sp.run(['cp' ,f'./{current_time}/output.html',  f'{app.root_path}/templates' ])

			# # remove newly created folder after contents copied
			# sp.run(['rm', '-rf', f'{current_time}'])
			# # return send_from_directory(app.root_path, filename='./templates/output.html', as_attachment=True)
			# # return send_from_directory(app.root_path, filename='output.html', as_attachment=True)
			# return send_from_directory(app.root_path, filename='output.html', as_attachment=True)
		# except FileNotFoundError:
			# return "File not found!"
		

def build_compile_script(filename, directory):
	# if it's a C/C++ file
	if filename.split('.')[1] == 'cpp': 
		return c_cpp_compile(filename, directory)

	# otherwise compile as Rust
	else:
		return rust_compile(filename)


def c_cpp_compile(filename, directory):
	rename, verbose, s_flags, template = '', '', '', ''
	s_flags += ' -s WASM=1 '
	# s_flags += ' -s EXPORTED_FUNCTIONS=[_main] '
	rename += f' -o {directory}/output.html '
	# rename += f' -o output.html '
	template += ' --shell-file ./templates/emscripten_template.html'
	# verbose += ' -v '
	
	return f'emcc {filename} -O3 {s_flags} {rename} {verbose} {template} -Wall'


def rust_compile(filename):
	pass
	
@app.route('/file/<directory>', methods=['GET'])
def getWASM(directory):	
	print(directory)
	return send_from_directory(app.root_path, filename=f'./{directory}/output.wasm', as_attachment=True)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)