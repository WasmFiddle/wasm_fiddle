from flask import Flask, request, send_from_directory, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('home.html')

@app.route('/compile', methods=['GET', 'POST'])
def compile():
	# Write to file
	#f = open('helloworld.cpp', 'a')
	#f.write('include <iostream> \n int main() {\nstd::cout << "Hello World!" << std::endl;\nreturn 0;\n}\nEOF'
	
	# Get form data code
	data = request.form.get("input_code","failed")
	print(data)
	
	return data
	
	# Define the location of the output file
	app.config["CLIENT_WASM"] = '/usr/src/app/'

	# Compile the C++/C file to WebAssembly
	os.system('emcc helloworld.cpp -s STANDALONE_WASM -o output.wasm')
	
	# Send the WASM file to the client
	try:
		return send_from_directory(app.config["CLIENT_WASM"], filename='output.wasm', as_attachment=True)
	except FileNotFoundError:
		return "File not found!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)