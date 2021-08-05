from flask import Flask, request, send_from_directory, render_template
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
		f = request.files['file']
		f.save(f.filename)
		
		# Define the location of the output file
		app.config["CLIENT_WASM"] = '/usr/src/app/'

		# ensure a past files aren't served 
		os.system('if [ -e output.wasm ]\nthen\nrm output.wasm\nfi')
		os.system('if [ -e output.txt ]\nthen\nrm output.txt\nfi')

		# Create directory
		now = datetime.now()
		current_time = now.strftime("%H%M%S")
		os.mkdir(current_time)
		
		# Compile the C++/C file to WebAssembly
		command = build_compile_script(f.filename, current_time).split()
		# print(command)

		# compile to WASM
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

		# Send the WASM file to the client
		try:
			return send_from_directory(app.root_path, filename='output.html', as_attachment=True)
		except FileNotFoundError:
			return "File not found!"


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
	s_flags += ' -s EXPORTED_FUNCTIONS=[_main] '
	rename += f' -o {directory}\output.html '
	template += ' --shell-file templates\emscripten_template.html'
	# verbose += ' -v '
	
	return f'emcc {filename} -O3 {s_flags} {rename} {verbose} {template} -Wall'


def rust_compile(filename):
	pass
	
@app.route('/output')
def getHTML():
	return send_from_directory(app.root_path, filename='output.js', as_attachment=False)
		
@app.route('/output.js')
def getJS():
	return send_from_directory(app.root_path, filename='output.js', as_attachment=False)
	
@app.route('/output.wasm')
def getWASM():
	return send_from_directory(app.root_path, filename='output.wasm', as_attachment=False)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)