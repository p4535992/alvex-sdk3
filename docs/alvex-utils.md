[![Build Status](https://travis-ci.org/ITDSystems/alvex-utils.svg?branch=master)](https://travis-ci.org/ITDSystems/alvex-utils)

Alvex common files
========================

This repository contains code and configuration files that are common for all Alvex components.

Compatible with Alfresco 5.1 and 5.2.

This component requires:
* [MapDB](https://github.com/jankotek/mapdb/)
* Aikau 1.0.101 -- Don't try to use 1.0.103, it doesn't work. We recommend to use 1.0.101.10, it's inside Alfresco 6.0.2-EA. In this extension we use 1.0.101.3 as dependency, because 1.0.101.10 has a problem with surf dependency resolution while building extension, don't worry extension will work with newer version.
* Aikau Forms Runtime Support of the same version as Aikau (it's not inside Alvex ZIP or AMP, be sure to install it manually)

# Using this project

Recommended way to use Alvex components is to include them as dependencies to your Maven project. Follow [this guide](https://github.com/ITDSystems/alvex#recommended-way-include-alvex-to-your-project-via-maven-configuration) to include this component to your project.

# Build from source

To build Alvex follow [this guide](https://github.com/ITDSystems/alvex#build-component-from-source).

