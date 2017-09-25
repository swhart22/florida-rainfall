

```python
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

```

    ['1000', '1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020', '1021', '1022', '1023', '1100', '1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108', '1109', '1110', '1111', '1112', '1113', '1114', '1115', '1116', '1117']



```python
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
```




<div>
<style>
    .dataframe thead tr:only-child th {
        text-align: right;
    }

    .dataframe thead th {
        text-align: left;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>1000</th>
      <th>1001</th>
      <th>1002</th>
      <th>1003</th>
      <th>1004</th>
      <th>1005</th>
      <th>1006</th>
      <th>1007</th>
      <th>1008</th>
      <th>1009</th>
      <th>...</th>
      <th>1108</th>
      <th>1109</th>
      <th>1110</th>
      <th>1111</th>
      <th>1112</th>
      <th>1113</th>
      <th>1114</th>
      <th>1115</th>
      <th>1116</th>
      <th>1117</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>count</th>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>...</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
      <td>4026.000000</td>
    </tr>
    <tr>
      <th>mean</th>
      <td>0.017198</td>
      <td>0.020678</td>
      <td>0.022591</td>
      <td>0.022906</td>
      <td>0.022422</td>
      <td>0.025025</td>
      <td>0.026215</td>
      <td>0.034257</td>
      <td>0.036905</td>
      <td>0.046838</td>
      <td>...</td>
      <td>0.092762</td>
      <td>0.095370</td>
      <td>0.100785</td>
      <td>0.102538</td>
      <td>0.100805</td>
      <td>0.109724</td>
      <td>0.114670</td>
      <td>0.115651</td>
      <td>0.107541</td>
      <td>0.114980</td>
    </tr>
    <tr>
      <th>std</th>
      <td>0.081256</td>
      <td>0.106514</td>
      <td>0.105326</td>
      <td>0.083297</td>
      <td>0.079066</td>
      <td>0.102228</td>
      <td>0.120047</td>
      <td>0.134196</td>
      <td>0.128814</td>
      <td>0.163570</td>
      <td>...</td>
      <td>0.198728</td>
      <td>0.198758</td>
      <td>0.195368</td>
      <td>0.182590</td>
      <td>0.175076</td>
      <td>0.165671</td>
      <td>0.171385</td>
      <td>0.171663</td>
      <td>0.183742</td>
      <td>0.202242</td>
    </tr>
    <tr>
      <th>min</th>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>...</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>25%</th>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>...</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
    </tr>
    <tr>
      <th>50%</th>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>...</td>
      <td>0.020000</td>
      <td>0.030000</td>
      <td>0.040000</td>
      <td>0.040000</td>
      <td>0.030000</td>
      <td>0.050000</td>
      <td>0.060000</td>
      <td>0.060000</td>
      <td>0.040000</td>
      <td>0.040000</td>
    </tr>
    <tr>
      <th>75%</th>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>...</td>
      <td>0.090000</td>
      <td>0.100000</td>
      <td>0.110000</td>
      <td>0.130000</td>
      <td>0.140000</td>
      <td>0.160000</td>
      <td>0.170000</td>
      <td>0.170000</td>
      <td>0.130000</td>
      <td>0.140000</td>
    </tr>
    <tr>
      <th>max</th>
      <td>1.220000</td>
      <td>2.000000</td>
      <td>1.720000</td>
      <td>1.160000</td>
      <td>0.900000</td>
      <td>1.880000</td>
      <td>2.870000</td>
      <td>2.300000</td>
      <td>2.340000</td>
      <td>1.950000</td>
      <td>...</td>
      <td>2.620000</td>
      <td>2.060000</td>
      <td>2.610000</td>
      <td>1.600000</td>
      <td>1.840000</td>
      <td>2.040000</td>
      <td>2.070000</td>
      <td>2.130000</td>
      <td>2.340000</td>
      <td>2.580000</td>
    </tr>
  </tbody>
</table>
<p>8 rows × 42 columns</p>
</div>




```python
#puts our shiny new dataset into a csv that we're gonna use for the graphic
df2.to_csv('output/output.csv')
```
