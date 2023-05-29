import serial
import csv
def stripper(x):
    return x.strip()
# set up the serial connection
ser = serial.Serial('COM6', 115200, timeout=1)
def takeScans(buffer,wifibuffer,wifiready):
    buffer  = []
    scans = 0
    while scans < 10:
        data = ser.readline().decode().strip()
        if data:
                values = data.split(",")
                values = list(map(stripper,values))
                if len(values) > 1:
                    buffer.append(values)
                    scans+=1
                else:
                    values = data.split("|")
                    values = list(map(stripper,values))
                    if len(values) > 1:
                        if values[0] == 'Nr':
                            wifiready = 0
                            wifibuffer = []
                        else:
                            wifibuffer.append([values[1],values[3],values[2]])
                            wifiready = 2 #allows wifi ready to be set to 1 when wifi data stops coming through
# read the entire CSV file into memory
rows = []
# read data from the port
cont = True
while cont:
    x = input('Enter x coord:')
    y = input('Enter y coord:')
    z = input('Enter z coord:')
    while scans < 5:
        
        if data:
            values = data.split("|")
            if len(values) > 1 and values[0] != 'Nr ':
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
            print(data)
            if data == "Scan start":
                scans += 1

    # update the CSV file with the modified data
    with open("map.csv", mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(rows)
    rows = []
    with open("map.csv", mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            if row != []:
                rows.append(row)
    cont = bool(input("New position?"))
    scans = 0
ser.close()  # close serial connection
