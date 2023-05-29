import csv
import matplotlib.pyplot as plt
import numpy as np

# Define the size of the heatmap
heatmap_size = (9, 23)

with open('map.csv', 'r') as file:
    # Create a CSV reader object
    reader = csv.reader(file)

    # Skip the header row
    next(reader)

    # Create a dictionary to store the groups
    groups = {}

    # Loop over the rows in the file
    for row in reader:
        # Extract columns 4 and 5
        if row[3]!= 'Unaccessible':
            group_key = (row[3], row[4])

            # Extract the values to average
            values_to_average = [float(x) for x in row[5:]]

            # Calculate the average
            avg = sum(values_to_average) / len(values_to_average)

        # Check if the group key is already in the dictionary
            if group_key in groups:
                # Add the average to the existing group
                groups[group_key].append([row[0],row[1],row[2],avg])
            else:
                # Create a new group with the average
                groups[group_key] = [[row[0],row[1],row[2],avg]]

    # Sort the groups by the average value

    # Print the sorted groups
    for row in groups:
        print(row)
        print(groups[row])
        heatmap = np.full(heatmap_size, np.nan)
        # Extract the x, y, and heat values
        for point in groups[row]:
            x = int(point[0])
            y = int(point[1])
            heat = float(point[3])

        # Add the heat value to the corresponding cell in the heatmap
            if 0 < x <= heatmap_size[1] and 0 < y <= heatmap_size[0]:
                heatmap[y-1, x-1] = heat

        # Create the heatmap plot
        plt.imshow(heatmap, cmap='hot', interpolation='nearest')
        plt.colorbar()

        # Add labels to the plot
        plt.xlabel('X')
        plt.ylabel('Y')
        plt.title(row)

        # Show the plot
        plt.show()
