# Experiment

## The common subfolder
The common subfolder contains three components for the experiments. A small overview is provided here, although it is advised to mostly rely on the template tasks (Need for Cognition and Mental Rotation) instead of dealing with the following files directly.

1. `css`: Contains the stylesheets that ensure a uniform layout/design for all pages of the experiment. We use [Pico CSS](https://picocss.com/) as a foundation. `main.css` contains base classes for most scenarios (and should therefore be included in all pages).
2. `js`: Contains the main JavaScript file (`webexp.js`) for the web-experiments. It provides functionality for saving data to the server, proceeding to the next task, changing page, etc. It should usually be included in all pages.
3. `storage`: Contains PHP-scripts (for the server backend) that create a new CSV-file (`create_person.php`) and allow to write to a specific CSV-file (`save_data.php`). The CSV-files are located in the `data` subfolder. On a server, it is important that the webserver process is allowed to write to that folder.

## Running the experiment
We recommend using [XAMPP](https://www.apachefriends.org/download.html) to run the experiment locally. After installing XAMPP, move the experiment in the respective webserver folder (HTDOCS in the XAMPP directory).

Then, the experiments can be run in the browser, and the data is safed locally.