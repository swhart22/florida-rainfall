
# coding: utf-8

# In[17]:

#import the libraries we want, glob deals with filenames
import pandas as pd
import numpy as np

import glob

#all my csvs are stored in a folder called "raw," this goes in and grabs all of the names
raw = glob.glob('raw/*')

#create dataframe, empty arrays to append to in the for loop below
df2 = pd.DataFrame()
names = []
list_ = []

#execute some code for each filename, i.e. each hour of rainfall
for filename in raw:
    
    #pulls out the part of the filename before the ‘/’, then before the ‘.’ to #get simply “DDHH”
    name = filename.split('/')[1]
    name = name.split('.')[0]
    
    #appends each name to the empty array above so that when done we have a
    #list of all the names (each hour)
    names.append(name)
    
    #actually reads the contents of each file and then stores the data in a variable called "data"
    data = pd.read_csv(filename, index_col=None, header=0)
    
    #adds a column to each data point called "DDHH" that contains the rainfall amount
    data[name] = data['Globvalue']
    
    #appends each dataset to a mega one called "list_"
    list_.append(data)

print names

#empty dataframe above is now data from each csv concatenated into one big dataset
df2 = pd.concat(list_)

for timeColumn in names:
    #fills in with 0 if a cell is blank (if there was no rainfall for that hour)
    df2[timeColumn] = df2[timeColumn].fillna(value=0)


# In[18]:

#sets bounds of datapoints we are interested in
boundY1 = 10.25
boundY2 = 35.081602
boundX1 = -90.4874294
boundX2 = -75.63

#whittles dataset down to points only within the above bounds
df2 = df2.loc[(df2['Lat'] >= boundY1) & (df2['Lat'] <= boundY2) & (df2['Lon'] <= boundX2) & (df2['Lon'] >= boundX1)]

#whittles dataset down to every third point by filtering out those whose grid indices are not divisible by 3
df2 = df2.loc[(df2['Hrapx'] % 3 == 0) & (df2['Hrapy'] % 3 == 0)]

#merges rows with common column names for each shown below
df2 = df2.groupby(['Id', 'Lat','Lon','Hrapy','Hrapx']).sum()

#gets rid of sum rainfall amount column, we don't really need that
df2 = df2.drop('Globvalue',1)

#shows how many datapoints we're dealing with now
df2.describe()


# In[19]:

#puts our shiny new dataset into a csv that we're gonna use for the graphic
df2.to_csv('output/output.csv')

