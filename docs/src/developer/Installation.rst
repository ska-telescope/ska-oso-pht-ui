Requirements
~~~~~~~~~~~~

This skeleton requires **Node** and **YARN** to install and run. 
To install these follow the instructions for your operating system at 

[https://nodejs.org/en/download/](https://nodejs.org/en/download/).

Alternatively the official Node docker image can be used. 
Instructions can be found on the 

[official Node docker image site](https://github.com/nodejs/docker-node/blob/master/README.md#how-to-use-this-image).


Installation
~~~~~~~~~~~~

The following notes assume you are at the command prompt for your chosen environment.

1.  Confirm Node and YARN are installed and configured correctly, both the following commands should return the relevant version number.

        > node --version

        > yarn --version

2.  Clone the project from GitHub

3.  Allow yarn to be able to include required SKA libraries

        > npm config set @ska-telescope:registry https://artefact.skao.int/repository/npm-internal/

4.  Install all the necessary project dependencies by running

        > yarn init

5.  Install required SKA libraries 

It is expected that required SKA libraries would have been included at this point,
however if this is found not to be the case, the following command will include them.

        > yarn skao:update
