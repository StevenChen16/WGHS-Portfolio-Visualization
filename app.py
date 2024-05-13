from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

@app.route('/update-data')
def update_data():
    try:
        # 执行 Python 脚本
        subprocess.run(['python3', '/var/www/html/static/WGHS-Portfolio-Visualization/performances.py'], check=True)
        subprocess.run(['python3', '/var/www/html/static/WGHS-Portfolio-Visualization/roa.py'], check=True)
        subprocess.run(['python3', '/var/www/html/static/WGHS-Portfolio-Visualization/index_data_download.py'], check=True)
        subprocess.run(['python3', '/var/www/html/static/WGHS-Portfolio-Visualization/classify_read.py'], check=True)
        return jsonify({'status': 'success', 'message': 'Data updated successfully'})
    except subprocess.CalledProcessError as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
