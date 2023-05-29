import serial
import csv
import re
# set up the serial connection
ser = serial.Serial('COM8', 115200, timeout=1)
scans = 0

# read the entire CSV file into memory
rows = []
try:
    with open("imutestData.csv", mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if row != []:
                rows.append(row)
except FileNotFoundError:
    with open("imutestData.csv", mode='w') as file:
        writer = csv.writer(file)
        writer.writerow(['Xa','Ya','Za','Xgr','Ygr','Zgr','Xma','Yma','Zma','Temp'])
    with open("imutestData.csv", mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if row != []:
                rows.append(row)
# read data from the port
z = 1
cancel = ''
while cancel != 'No':
        ser.reset_input_buffer()
        rows.append(["Initialising"])
        for i in range(10): 
            data = ser.readline().decode().strip()
            while not data:
                data = ser.readline().decode().strip()
            # Extract numbers using regex
            numbers = re.findall(r"-?\d+\.\d+", data)

            # Convert strings to floats
            numbers = [float(num) for num in numbers]
            rows.append(numbers)
            print(numbers)
            print(data)
        rows.append(['Start'])
        input('Start')
        ser.reset_input_buffer()
        for i in range(30):
            
            data = ser.readline().decode().strip()
            while not data:
                data = ser.readline().decode().strip()
            numbers = re.findall(r"-?\d+\.\d+", data)

            # Convert strings to floats
            numbers = [float(num) for num in numbers]
            rows.append(numbers)
            print(numbers)
            print(data)
        print('STOP')
        x = input("X:")
        y = input("Y:")
        rows.append(["Destination:",x,y])
            # update the CSV file with the modified data
        with open("imutestData.csv", mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(rows)
        rows = []
        with open("imutestData.csv", mode='r') as file:
            reader = csv.reader(file)
            for row in reader:
                if row != []:
                    rows.append(row)
        cancel = input("Ready?")
ser.close()  # close serial connection
