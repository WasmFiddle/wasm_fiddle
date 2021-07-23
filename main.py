from flask import Flask, request, send_from_directory, render_template
import os

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

		# Compile the C++/C file to WebAssembly
		# os.system('emcc {} EXPORTED_FUNCTIONS=\'["_main"]\' -s EXTRA_EXPORTED_RUNTIME_METHODS=\'["cwrap"]\'-s STANDALONE_WASM -o output.wasm'.format(f.filename))
		os.system('emcc {} -s EXPORTED_FUNCTIONS=\'["_main"]\' -s STANDALONE_WASM -o output.wasm'.format(f.filename))
		# os.system('emcc {} -s STANDALONE_WASM -o output.wasm'.format(f.filename))
		
		# Send the WASM file to the client
		try:
			print(app.root_path)
			return send_from_directory(app.root_path, filename='output.wasm', as_attachment=True)
		except FileNotFoundError:
			return "File not found!"

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                          'img/logo.svg',mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)