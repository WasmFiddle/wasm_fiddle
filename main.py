from flask import Flask, request, send_from_directory, render_template
import contextlib
import subprocess as sp
import os
import sys

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

		# Compile the C++/C file to WebAssembly
		command = build_compile_script(f.filename).split()
		# print(command)

		# compile to WASM
		compile_log = sp.run(command, capture_output=True, text=True)

		# send stdout & stderr to text file
		with open('output.txt', 'a') as outfile:
			if compile_log.stdout:
				outfile.write(compile_log.stdout)

			if compile_log.stderr:
				outfile.write(compile_log.stderr)


		# original call
		# os.system('emcc {} -s STANDALONE_WASM -o output.wasm'.format(f.filename))
		
		# Send the WASM file to the client
		try:
			print(app.root_path) 
			return send_from_directory(app.root_path, filename='output.wasm', as_attachment=True)
		except FileNotFoundError:
			return "File not found!"


def build_compile_script(filename):
	rename, verbose, s_flags = '', '', ''
	# if it's a C/C++ file
	if filename.split('.')[1] == 'cpp': 
		print(True)
		s_flags += ' -s EXPORTED_FUNCTIONS=[_main] '
		s_flags += ' -s STANDALONE_WASM '
		rename += ' -o output.wasm '
		verbose += ' -v '
	
	# otherwise compile as Rust
	else:
		pass

	return f'emcc {filename} {s_flags} {rename} {verbose} -Wall'


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)