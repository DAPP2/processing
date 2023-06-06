import numpy as np
from copy import deepcopy
import matplotlib.pyplot as plt
import random
def getScore(myDict,key):
    if key in myDict:
        if not myDict[key][3]:
            return myDict[key][0]+myDict[key][1]
        else:
            return np.inf        

def makeGrid(x,y,*blocks):
    grid = []
    for a in range(y):
        row = []
        for b in range(x):
            if (b,a) in blocks:
                row.append(1)
            else:
                row.append(0)
        grid.append(row)
    return np.array(grid)

def makeRanWalls(size):
    coordinates = []
    for _ in range(int(size**2/8)):
        x = random.randint(0, size-1)
        y = random.randint(0, size-1)
        coordinates.append((x, y))

    return coordinates

def checkDistance(curr,dest):
    x = ((curr[0]-dest[0])**2 + (curr[1]-dest[1])**2)**(1/2)
    return ((curr[0]-dest[0])**2 + (curr[1]-dest[1])**2)**(1/2)

def checkSurround(point,dest,grid):
    y = len(grid)
    x = len(grid[0])
    close = []
    for i in range(-1,2):
        if x> (point[0]+i) and(point[0]+i) >= 0:
            for j in range(-1,2):
                if i == j == 0:
                    pass
                else:
                    if y > (point[1]+j) and (point[1]+j) >= 0:
                        if grid[point[1]+j][point[0]+i] != 1:
                            close.append([(point[0]+i,point[1]+j),checkDistance((point[0]+i,point[1]+j),dest),(abs(i)+abs(j))**(1/2)])
    return close

def astar(start, end,grid):
    curr = start
    ranking = {deepcopy(curr):[checkDistance(curr,end),0,[],False]}
    while end not in ranking:
        ranking[curr][3] = True
        close = checkSurround(curr,end,grid)
        for node in close:
           if node[0] in ranking:
                if ranking[node[0]][1]+ranking[node[0]][0] > node[1]+node[2]+ranking[curr][1]:
                    buff = deepcopy(ranking[curr][2])
                    buff.append(curr)
                    ranking[node[0]] = [node[1],node[2]+ranking[curr][1],buff,False]
           else:
               buff = deepcopy(ranking[curr][2])
               buff.append(curr)
               ranking[node[0]] = [node[1],node[2]+ranking[curr][1],buff,False]
        stuckCheck = min(ranking, key=lambda key: getScore(ranking, key))
        if getScore(ranking,stuckCheck) == np.inf:
            curr = end
            print('No available path')
            return [None,None]
        else:
            curr = stuckCheck
        
        print(curr)
    path = deepcopy(ranking[end][2])
    return [path,ranking]


def visualizeGrid(array):
    cmap = plt.cm.colors.ListedColormap(['black', 'white','yellow', 'green','red'])
    bounds = [0, 1,3, 7, 8,9]  # Defines the boundaries for the colors
    norm = plt.cm.colors.BoundaryNorm(bounds, cmap.N)

    plt.imshow(array, cmap=cmap, norm=norm)
    plt.axis('off')
    plt.show()

def trial(size):
    gridA = makeGrid(size,size,*makeRanWalls(size))
    print(gridA)
    start = (random.randint(0,size-1),random.randint(0,size-1))
    end = (random.randint(0,size-1),random.randint(0,size-1))
    gridA[start[1]][start[0]] = 8
    gridA[end[1]][end[0]] = 8
    visualizeGrid(gridA)
    print([start,end])
    path,checked = astar(start,end,gridA)
    if type(checked) == dict:
        for i in checked:
            gridA[i[1]][i[0]] = 3
    if type(path) == list:
        for i in path:
            gridA[i[1]][i[0]] = 7
        for i in gridA:
            print(i)
        gridA[start[1]][start[0]] = 8
        visualizeGrid(gridA)


trial(250)
