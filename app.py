from flask import jsonify
import subprocess

def update_data():
    try:
        subprocess.run(['python', 'D:/workstation/echarts/self/test/performances.py'], check=True)
        print("Performances.py executed successfully.")
        subprocess.run(['python', 'D:/workstation/echarts/self/test/roa.py'], check=True)
        print("Roa.py executed successfully.")
        # return jsonify({'status': 'success', 'message': 'Data updated successfully'})
    except subprocess.CalledProcessError as e:
        print("Error executing scripts:", e)
    
update_data()