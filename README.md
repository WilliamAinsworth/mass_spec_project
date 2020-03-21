Mass Spectrometry Data Visualisation

Final Year project for Computing Science Degree at University of Glasgow.

William Ainsworth
2248889A

### Instructions

- Currently the html files need to be hosted on a local server so that the data can be accessed, live server vscode extension or similar work.

- getData() function accepts csv files of the format: x,y with just 2 columns
- json files and javascript objects with the format below, however it still works if n_peaks and precursoe_mz are ommitted. This is the format that https://metabolomics-usi.ucsd.edu/ uses.


{
    "n_peaks": 26,
    "peaks": [
        [
            157.2763671875,
            1219.0
        ], 

        ...


        [
            196.95391845703125,
            2328.0
        ]

    ],
    "precursor_mz": 443.1
}