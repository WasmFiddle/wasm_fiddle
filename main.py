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

		# ensure a past file isn't served 
		os.system('if [ -e output.wasm ]\nthen\nrm output.wasm\nfi')

		# Compile the C++/C file to WebAssembly
		command = build_compile_script(f.filename).split()
		# print(command)

		# get debug information 
		os.system('set EMCC_DEBUG=1');

		# send output to text file
		# with open('output.txt', 'w') as outfile, contextlib.redirect_stdout(outfile):
		sp.check_output(command)
		# proc = sp.Popen(command, stdout=sp.PIPE)
		# output = proc.communicate()[0]
		# print(output)
		# os.system('emcc {} -s STANDALONE_WASM -o output.wasm'.format(f.filename))
		
		# Send the WASM file to the client
		try:
			print(app.root_path) 
			return send_from_directory(app.root_path, filename='output.wasm', as_attachment=True)
		except FileNotFoundError:
			return "File not found!"


def build_compile_script(filename):
	# if it's a C/C++ file
	if filename.split('.')[1] == 'cpp': 
		print(True)
		s_flags = ''
		s_flags += ' -s EXPORTED_FUNCTIONS=[_main]'
		s_flags += ' -s STANDALONE_WASM '
		rename = ' -o output.wasm '
	
	# otherwise compile as Rust
	else:
		pass

	return f'emcc {filename} {s_flags} {rename}'


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 
	'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)