import math
import random
import tkinter as tk
from PIL import ImageTk, Image


class Point:
    def __init__(self, x, y, z, calc_x, calc_y, calc_z, group=1):
        self.x = x
        self.y = y
        self.z = z
        self.calc_x = calc_x
        self.calc_y = calc_y
        self.calc_z = calc_z
        self.group = group


# reading csv/txt file
def readfile():
    while True:
        try:
            selected_path = str(input("Select a file in which the data is in .csv (comma separated values) format."
                                      "\nMay be .txt as well. You must specify the full path here: "))
            selected_file = open(selected_path, "r")
            raw_string_list = selected_file.readlines()
            file_string_list = []
            for item in raw_string_list:
                stripped_item = item.strip("\n")
                new_item = stripped_item.split(",")
                file_string_list.append(new_item)

        except FileNotFoundError:
            print("File not found!")
            print("")
            continue
        except Exception:
            print("Unknown error occurred in reading file!")
            print("")
            continue
        else:
            return file_string_list


# selecting dimensions (2D/3D). It will be displayed in the GUI accordingly
def select_dimensions():
    input_dimensions = 2
    while True:
        try:
            input_dimensions = int(input("Do you want to perform a 2D or a 3D clustering? (2/3): "))
        except ValueError:
            print("Input either 2 or 3 as a whole number!")
            continue
        except Exception:
            print("Unknown error occurred in selecting dimensions!")
            continue
        else:
            if input_dimensions != 2 and input_dimensions != 3:
                print("Input either 2 or 3 as a whole number!")
                continue
            else:
                print("")
                print(f"You selected {input_dimensions}D clustering!")
                break
    return input_dimensions


# selecting columns in which the data will be organised into clusters. Columns 1, 2, 3 will later become axis x, y, z
def select_columns():
    global file_contents

    print("")
    print("Columns available for clustering:")
    for counter, item in enumerate(file_headline, 1):
        print(f"{counter}: {item}")

    selected = 0
    columns = []
    input_column = 0
    while selected < dimensions:
        while True:
            try:
                print("First selection will become axis 'x' second will become axis 'y' and third will become axis 'z'")
                input_column = int(input(f"Select a column from 1 to {nr_of_columns}: "))
            except ValueError:
                print("You must enter a whole number!")
                continue
            except Exception:
                print("Unknown error occurred in selecting columns!")
                continue
            else:
                break

        if input_column < 1 or input_column > nr_of_columns:
            print("Error")
            continue
        else:
            try:
                for line in file_contents:
                    test_float_conversion = float(line[input_column - 1])
            except ValueError:
                print("Selected column doesn't consist of numbers! Please select another one")
                continue
            except Exception:
                print("Unknown error occured on selecting columns")
                continue

            selected += 1
            columns.append(input_column)
            continue
    return columns


def select_clusters():
    input_clusters = 0
    while input_clusters < 2:
        while True:
            try:
                input_clusters = int(input("Enter the number of clusters: "))
            except ValueError:
                print("You must enter a whole number!")
                continue
            except Exception:
                print("Unknown error occurred in selecting clusters!")
                continue
            else:
                break

        if input_clusters < 2:
            print("Must have at least 2 clusters!")
            continue
        else:
            break
    return input_clusters


# filtering data of the selected columns and trying to convert them to 'float'
def process_useful_data():
    processed_useful_data = []
    try:
        for line in file_contents:
            useful_line = []
            for count, number in enumerate(selected_columns):
                useful_line.append(float(line[selected_columns[count]-1]))
            processed_useful_data.append(useful_line)
    except ValueError:
        print("Data doesn't consist of numbers!")
    except Exception:
        print("Unknown error occurred in processing useful data!")
    else:
        return processed_useful_data


def point_constructor():
    constructed_points = []
    for line in useful_data:
        if dimensions == 2:
            new_point = Point(line[0], line[1], 0.0, line[0], line[1], 0.0)
            constructed_points.append(new_point)
        elif dimensions == 3:
            new_point = Point(line[0], line[1], line[2], line[0], line[1], line[2])
            constructed_points.append(new_point)
        else:
            print("Error occurred in constructing points! Dimensions are neither 2 or 3")
    return constructed_points


# x-y min-max calculator
def calculate_minmax():
    global x_max
    global x_min
    global y_max
    global y_min
    global z_max
    global z_min

    first = True
    for point in points:
        if first:
            x_max = point.x
            x_min = point.x
            y_max = point.y
            y_min = point.y
            z_max = point.z
            z_min = point.z
            first = False
        else:
            if point.x > x_max:
                x_max = point.x
            if point.x < x_min:
                x_min = point.x
            if point.y > y_max:
                y_max = point.y
            if point.y < y_min:
                y_min = point.y
            if point.x > x_max:
                z_max = point.z
            if point.z < z_min:
                z_min = point.z


# for calculation purposes this function equalizes all axis to the length of axis X.
# if axis X has no length (data has one less dimensions than set) it is equalized to axis Y
# similarly if Y has no length it is equalized to axis Z
def line_equalizer():
    global points
    global x_min
    global x_max
    global y_min
    global y_max
    global z_min
    global z_max
    length_x = x_max - x_min
    length_y = y_max - y_min
    length_z = z_max - z_min
    ratio_yx = 1.0
    ratio_zx = 1.0
    ratio_zy = 1.0

    if length_x != 0:
        ratio_yx = length_y / length_x
        if length_y != 0:
            for point in points:
                point.calc_y = point.y / ratio_yx

        ratio_zx = length_z / length_x
        if length_z != 0:
            for point in points:
                point.calc_z = point.z / ratio_zx

    elif length_y != 0:
        ratio_zy = length_z / length_y
        if length_z != 0:
            for point in points:
                point.calc_z = point.z / ratio_zy


# the main calculations of cluster making are done here:
def cluster_maker():

    def distance(point1, point2):
        dist_x = abs(point2.calc_x - point1.calc_x)
        dist_y = abs(point2.calc_y - point1.calc_y)
        dist_z = abs(point2.calc_z - point1.calc_z)
        dist_to_return = math.sqrt(dist_x ** 2 + dist_y ** 2 + dist_z ** 2)
        return dist_to_return

    def new_center():
        new_centers_to_return = []
        for item in range(nr_of_clusters):
            sum_x = 0.0
            sum_y = 0.0
            sum_z = 0.0
            center_x = None
            center_y = None
            center_z = None
            counter = 0
            for point in points:
                if point.group == item+1:
                    sum_x += point.calc_x
                    sum_y += point.calc_y
                    sum_z += point.calc_z
                    counter += 1
            if counter != 0:
                center_x = sum_x / counter
            if counter != 0:
                center_y = sum_y / counter
            if counter != 0:
                center_z = sum_z / counter
            center_point = Point(center_x, center_y, center_z, center_x, center_y, center_z)
            new_centers_to_return.append(center_point)
        return new_centers_to_return

    global points
    global center_points
    global nr_of_clusters
    old_center_points = None
    new_center_points = None
    process_finished = False

    # selecting center points randomly from existing points
    counter = 0
    center_point_spawn_source = []
    for item in points:
        center_point_spawn_source.append(item)

    while counter < nr_of_clusters:
        random_point = random.choice(center_point_spawn_source)
        new_center_point = random_point
        center_points.append(new_center_point)
        center_point_spawn_source.remove(random_point)
        counter += 1

    while not process_finished:
        # assigning points to their clusters
        for point in points:
            shortest_distance = None
            group_counter = 1
            for center in center_points:
                dist = distance(point, center)
                if shortest_distance is None:
                    shortest_distance = dist
                    point.group = group_counter
                elif shortest_distance > dist:
                    shortest_distance = dist
                    point.group = group_counter
                group_counter += 1

        new_center_points = new_center()
        old_center_points = center_points
        center_points = new_center_points

        # comparing old and new center points to determine if the process is finished or not
        for cluster in range(nr_of_clusters):
            if (old_center_points[cluster].x == new_center_points[cluster].x and
                    old_center_points[cluster].y == new_center_points[cluster].y and
                    old_center_points[cluster].z == new_center_points[cluster].z):
                process_finished = True


# ------------------ MAIN ------------------ MAIN ------------------ MAIN ------------------ #


print(">>> CLUSTERING <<<")
print("")
print("Operation:")
print("1: User selects a csv-type file")
print("2: User selects 2D or 3D clustering - Only 2D available for now")
print("3: User specifies the columns they want to organise into clusters")
print("4: User specifies the number of clusters")
print("5: Program calculates the position of clusters and displays them on a graph")
print("")
print("")

# variables:
file_contents = []
file_headline = []
dimensions = 0
useful_data = []
nr_of_columns = 0
selected_columns = []
nr_of_clusters = 0
points = []
center_points = []
x_max = 0.0
x_min = 0.0
y_max = 0.0
y_min = 0.0
z_max = 0.0
z_min = 0.0
x_ratio = 1.0
y_ratio = 1.0
z_ratio = 1.0

while True:
    file_contents = readfile()
    file_headline = file_contents[0]
    file_contents.pop(0)
    nr_of_columns = len(file_headline)
    if nr_of_columns < 2:
        print("Incorrect file! Must have at least 2 columns!")
        print("Select another file!")
        continue
    else:
        print("File successfully selected")
        print("")
        break

# 3D not yet implemented!
#
# CODE!
# while True:
#     dimensions = select_dimensions()
#     if dimensions > nr_of_columns:
#         print("File has too few columns of data for selected dimensions!")
#         print("Specify a lower number of dimensions!")
#         continue
#     else:
#         print("")
#         break

# TEMPORARY CODE
print()
print("ONLY 2D CLUSTERING IS AVAILABLE DUE TO GRAPHICAL INTERFACE LIMITATIONS")
print("3D COMING IN THE FUTURE")
print()
dimensions = 2

selected_columns = select_columns()
nr_of_clusters = select_clusters()
useful_data = process_useful_data()
points = point_constructor()
calculate_minmax()
line_equalizer()
cluster_maker()


# ------------------ GUI ------------------ GUI ------------------ GUI ------------------ #


if nr_of_clusters <= 8:
    root = tk.Tk()

    if (x_max - x_min) == 0:
        x_ratio = 1.0
    else:
        x_ratio = 850 / (x_max - x_min)
    if (y_max - y_min) == 0:
        y_ratio = 1.0
    else:
        y_ratio = 850 / (y_max - y_min)
    if (z_max - z_min) == 0:
        z_ratio = 1.0
    else:
        z_ratio = 850 / (z_max - z_min)

    x_coord_max = x_max * x_ratio
    x_coord_min = x_min * x_ratio
    y_coord_max = y_max * y_ratio
    y_coord_min = y_min * y_ratio
    z_coord_max = z_max * z_ratio
    z_coord_min = z_min * z_ratio

    img_red_path = 'images\\Red5.png'
    img_blue_path = 'images\\Blue5.png'
    img_black_path = 'images\\Black5.png'
    img_brown_path = 'images\\Brown5.png'
    img_green_path = 'images\\Green5.png'
    img_grey_path = 'images\\Grey5.png'
    img_purple_path = 'images\\Purple5.png'
    img_yellow_path = 'images\\Yellow5.png'
    img_orange_path = 'images\\Orange5.png'
    img_crimson_path = 'images\\Crimson5.png'
    red_point = Image.open(img_red_path)
    blue_point = Image.open(img_blue_path)
    black_point = Image.open(img_black_path)
    brown_point = Image.open(img_brown_path)
    green_point = Image.open(img_green_path)
    grey_point = Image.open(img_grey_path)
    purple_point = Image.open(img_purple_path)
    yellow_point = Image.open(img_yellow_path)
    orange_point = Image.open(img_orange_path)
    crimson_point = Image.open(img_crimson_path)

    canvas = tk.Canvas(root, height=1010, width=1010, bg='beige')
    canvas.create_line(150, 860, 1000, 860)                         # x-axis
    canvas.create_line(150, 10, 150, 860)                           # y-axis
    canvas.red_point = ImageTk.PhotoImage(red_point)
    canvas.blue_point = ImageTk.PhotoImage(blue_point)
    canvas.black_point = ImageTk.PhotoImage(black_point)
    canvas.brown_point = ImageTk.PhotoImage(brown_point)
    canvas.green_point = ImageTk.PhotoImage(green_point)
    canvas.grey_point = ImageTk.PhotoImage(grey_point)
    canvas.purple_point = ImageTk.PhotoImage(purple_point)
    canvas.yellow_point = ImageTk.PhotoImage(yellow_point)
    canvas.orange_point = ImageTk.PhotoImage(yellow_point)
    canvas.crimson_point = ImageTk.PhotoImage(yellow_point)

    # test image - deactivated
    # canvas.create_image(100.5, 200.84326, image=canvas.red_point)

    # little cross-lines (x then y)
    for n in range(5):
        canvas.create_line((1000 - n * 170), 855, (1000 - n * 170), 866)
        canvas.create_line(145, (10 + n * 170), 156, (10 + n * 170))

    # AXIS text - variable
    canvas.create_text(575, 930, fill="black", font="Times 20 bold", text=file_headline[selected_columns[0] - 1])
    canvas.create_text(70, 90, fill="black", font="Times 20 bold", text=file_headline[selected_columns[1] - 1])

    # AXIS scale numbers - variable (x then y) y1 and x6 are created differently for space reasons
    for n in range(5):
        canvas.create_text((150 + n * 170), 880, fill="black", font="Times 15 bold",
                           text="%.2f" % (x_min + ((x_max - x_min) / 5) * n))
        canvas.create_text(110, (690 - n * 170), fill="black", font="Times 15 bold",
                           text="%.2f" % (y_min + ((y_max - y_min) / 5) * (n + 1)))
    canvas.create_text(970, 880, fill="black", font="Times 15 bold", text=("%.2f" % x_max))
    canvas.create_text(110, 850, fill="black", font="Times 15 bold", text=("%.2f" % y_min))

    for point in points:
        image_color = None
        if point.group == 1:
            image_color = canvas.red_point
        elif point.group == 2:
            image_color = canvas.blue_point
        elif point.group == 3:
            image_color = canvas.green_point
        elif point.group == 4:
            image_color = canvas.grey_point
        elif point.group == 5:
            image_color = canvas.brown_point
        elif point.group == 6:
            image_color = canvas.crimson_point
        elif point.group == 7:
            image_color = canvas.orange_point
        elif point.group == 8:
            image_color = canvas.yellow_point
        canvas.create_image((150.0 - (x_min * x_ratio) + (point.x * x_ratio)),
                            (860.0 + (y_min * y_ratio) - (point.y * y_ratio)), image=image_color)

    canvas.pack()

    root.mainloop()

else:
    print("Too many clusters")
    print("Graphical interface can only display up to 8 clusters due to readability")
