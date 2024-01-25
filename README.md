# SKA OSO PHT UI

[![Documentation Status](https://readthedocs.org/projects/ska-oso-pht-ui/badge/?version=latest)](https://developer.skatelescope.org/projects/ska-oso-pht-ui/en/latest/?badge=latest)

## Description

This repository contains a modular federated component that is used to handle the process of proposal submission

## Documentation

Please see the latest project documentation on RTD: https://developer.skao.int/projects/ska-oso-pht-ui/en/latest/?badge=latest

## Contributing

Contributions are welcome, please see the SKAO developer portal for guidance. https://developer.skao.int/en/latest/

## Redux usage

Some of the common variables have been moved into Redux to make them accessible everywhere
This is is as follows:

Application.Content1 => Status of the proposal for each page
Application.Content2 => Proposal which is being edited
Application.Content3 => Original copy of the loaded proposal for comparison

Help.component => Populated with field-dependant help

## Project status

In development.
