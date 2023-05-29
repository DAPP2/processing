import serial
import csv

# set up the serial connection
ser = serial.Serial('COM8', 115200, timeout=1)
scans = 0

# read the entire CSV file into memory
rows = []
try:
    with open("testData.csv", mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if row != []:
                rows.append(row)
except FileNotFoundError:
    with open("testData.csv", mode='w') as file:
        writer = csv.writer(file)
        writer.writerow(['X','Y','Z','SSID','Channel','RSSI'])
    with open("testData.csv", mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if row != []:
                rows.append(row)
# read data from the port
z = 1
cancel = ''
for x in range(10,24):
    print("New Column")
    for y in range(1,10):
        if cancel != "NO":
            cancel = input("Ready to read")
        if cancel == "block":
            rows.append([x,y,z,'Unaccessible'])
            with open("testData.csv", mode='w', newline='') as file:
                writer = csv.writer(file)
                writer.writerows(rows)
            rows = []
            with open("testData.csv", mode='r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if row != []:
                        rows.append(row)
            scans = 0
        elif cancel != "NO":
            ser.reset_input_buffer()
            reading = False
            scanned = False
            while scans < 6:
                data = ser.readline().decode().strip()
                if data:
                    values = data.split("|")
                    if values[0] == 'Scan start':
                        scanned = True
                        scans += 1
                    elif values[0] == 'Nr ' and scanned:
                        reading = True
                    elif len(values) > 1 and reading == True:
                        ssid = values[1].strip()
                        rssi = values[2].strip()
                        channel = values[3].strip()
                        target = None
                        for i, row in enumerate(rows):
                            if x == row[0] and y == row[1] and z == row[2] and row[3] == ssid and row[4] == channel:
                                target = i
                        if target is None:
                            rows.append([x,y,z,ssid, channel, rssi])
                        else:
                            rows[target].append(rssi)
                    else:
                        reading = False
                    print(data)
            
            # update the CSV file with the modified data
            with open("testData.csv", mode='w', newline='') as file:
                writer = csv.writer(file)
                writer.writerows(rows)
            rows = []
            with open("testData.csv", mode='r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if row != []:
                        rows.append(row)
            scans = 0
ser.close()  # close serial connection
