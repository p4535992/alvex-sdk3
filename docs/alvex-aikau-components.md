**This extension for Alfresco is obsolete and unsupported. Use it on your own risk.**

[![Build Status](https://travis-ci.org/ITDSystems/alvex-aikau-components.svg?branch=master)](https://travis-ci.org/ITDSystems/alvex-aikau-components)

# Alvex Aikau Components
Generic components for use in other extensions. 

Compatible with Alfresco 5.1 and 5.2.

This component requires:
* [Alvex Utils](https://github.com/ITDSystems/alvex-utils)
* Aikau 1.0.101 or later
* Aikau Forms Runtime Support

## Form

### alvex/forms/FormWithWarning

Extends [alfresco/forms/Form](http://dev.alfresco.com/resource/docs/aikau-jsdoc/Form.html).
Adds warning on the bottom of the form if not all required fields are filled.

## Form Controls

### alvex/forms/controls/BaseFormControl

Extends [alfresco/forms/controls/BaseFormControl](http://dev.alfresco.com/resource/docs/aikau-jsdoc/BaseFormControl.html).
Disables validation of the field, if field is hidden (also if section with a field is hidden).

### alvex/forms/controls/CheckBox

Extends [alfresco/forms/controls/CheckBox](http://dev.alfresco.com/resource/docs/aikau-jsdoc/CheckBox.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

### alvex/forms/controls/DateTextBox

Extends [alfresco/forms/controls/DateTextBox](http://dev.alfresco.com/resource/docs/aikau-jsdoc/DateTextBox.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

Date format: dd.MM.yyyy

If empty, uses empty string as a value (""), not null.

### alvex/forms/controls/FileUploader

Form control to attach files from local drive or to select existing files in the repository on any form.
Currently upload files to the user home folder. Later will be added support to select a folder.
Attributes:
#### addedAndRemovedValues: boolean
Indicates whether values should be set as separate properties for the files added and removed (from the initial state) rather than just a single value representing the files selected.
#### multipleItemMode: boolean 
Indicates whether or not more than one can be selected. Default value: false
#### filterMimeType: string 
Types of files to accept. By default accept all files. Sample: ".gif, .jpg, .png, .doc"
#### valueDelimiter: string
An optional token that can be provided for splitting the supplied value. This should be configured when the value is provided as a string that needs to be converted into an array. Default value: ","

### alvex/forms/controls/FilteringSelect

Extends [alfresco/forms/controls/FilteringSelect](http://dev.alfresco.com/resource/docs/aikau-jsdoc/FilteringSelect.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

### alvex/forms/controls/ReadOnlyDocument

Extends [alvex/forms/controls/BaseFormControl](http://dev.alfresco.com/resource/docs/aikau-jsdoc/BaseFormControl.html).
Mixes in alvex/renderers/Document.

### alvex/forms/controls/Select

Extends [alfresco/forms/controls/Select](http://dev.alfresco.com/resource/docs/aikau-jsdoc/Select.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

### alvex/forms/controls/TextArea

Extends [alfresco/forms/controls/TextArea](http://dev.alfresco.com/resource/docs/aikau-jsdoc/TextArea.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

### alvex/forms/controls/TextBox

Extends [alfresco/forms/controls/TextBox](http://dev.alfresco.com/resource/docs/aikau-jsdoc/TextBox.html).
Mixes in alvex/forms/controls/BaseFormControl. Disables validation of the field, if field is hidden (also if section with a field is hidden).

## Lists

### alvex/lists/Paginator

Fork of alfresco/lists/Paginator not to render page selector and to render text about the list size. Better support of lists with > 100 pages.

## Renderers

### alvex/renderers/Document

Renders file thumbnail and title from nodeRef. Shows preview on click. Supports multiple nodeRefs separated by a comma.
Requires DocumentService and NodePreviewService on the page to show preview.

### alvex/renderers/InlineEditDateTextBox

Extends [alfresco/renderers/InlineEditProperty](http://dev.alfresco.com/resource/docs/aikau-jsdoc/InlineEditProperty.html).
Mixes in alvex/forms/controls/DateTextBox.

### alvex/renderers/InlineEditFilteringSelect

Extends [alfresco/renderers/InlineEditProperty](http://dev.alfresco.com/resource/docs/aikau-jsdoc/InlineEditProperty.html).
Mixes in alvex/forms/controls/FilteringSelect.

## Services

### alvex/services/FormsRuntimeService

Fork of http://dev.alfresco.com/resource/docs/aikau-jsdoc/FormsRuntimeService.js.html to extend it with new widgets.
Extend this Service with your custom widgets like this: https://github.com/ITDSystems/alvex-registers/blob/master/share/src/main/amp/web/js/alvex/services/RegisterFormsRuntimeService.js

# Using this project

Recommended way to use Alvex components is to include them as dependencies to your Maven project. Follow [this guide](https://github.com/ITDSystems/alvex#recommended-way-include-alvex-to-your-project-via-maven-configuration) to include this component to your project.

# Build from source

To build Alvex follow [this guide](https://github.com/ITDSystems/alvex#build-component-from-source).

# Description

This component includes a number of Aikau widgets and services that we use in other components. Patched Forms Runtime Service is a part of this repository. Alvex Uploader based on Aikau to upload files to Alfresco on any form is a part of this repo too