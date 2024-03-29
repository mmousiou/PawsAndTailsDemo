# 🐶Paws&Tails - Demo
A salesforce demo presented in the EmPowerfulWomen event hosted by Deloitte.

## Table of contents

- [Application Lifecycle](#application-lifecycle)
- [Business Case](#business-case)
- [Phase 1 - Requirement Analysis and Data Structure](#requirement-analysis-and-data-structure)
- [Phase 1 - Design](#design)
- [Phase 3 - Development](#development)

- [Phase 4 - Testing](#testing)
- [Usefull links](#links)
- [Collaborators Info](#info)

## Application Lifecycle

<img src="/photos/Agile.png" width="600">

## Business Case
<img src="/photos/PawsAndTailsLogoTrimmed.png" width="300">

### Business Overview
Paws & Tails is a grooming salon that recently setup their CRM system using Salesforce. They have setup Accounts to hold info on client families and organizations, Contacts for specific people within the families on the Accounts, Products for the products, services and packages offered by the salon and Opportunities and Campaigns to utilize marketing campaigns, Referral Programs and Discount Packages.

### Business Requirements
Paws & Tails wants to enhance their CRM system with a new Appointment Management System.
They want to be able to add new appointments and search all the appointments for a selected date. The app must print all the available appointments info: Code, Time, Pet Name, Contact Name, Services.

## Requirement Analysis and Data Structure
### General guidlines
* Gather detailed requirements, including data entities, relationships, and attributes.
* Understand user needs and expectations.
* Create the Entity Relationship Diagram (ERD) to visualize the data model. (it is usually on the design phase but it is easier to see the datamodel with it)

### Specific: Define schema and ERD
* how many objects should be added?
* which fields should these new objects have?
* for each of these new objects can you define the relationships?

<img src="/photos/ERDInfo.PNG" width="600">


## Design
* Design the user interface (UI) and user experience (UX).
* Plan the architecture and technology stack
* Design flowcharts for complex algorithms, decision trees, or business logic

<img src="/photos/UI%20UX%20design.PNG" width="600">

## Development
### Challenge:
- Utilize Salesforce Lightning components for an intuitive appointment management interface
- Write code based on the design specifications.
- Develop both the frontend and backend components.

### Key Considerations:
- Lightning components for a user-friendly interface.
- Gather appointments from salesforce database (Utilize AI for code)
- Write code based on the design specifications.

### Code Sample
* Download the .zip file
* Add the contents of the classes and lwc folders to the respected folders of your org's \force-app\main\default directory

## Testing
The testing phase is crucial to ensure that the implemented Salesforce solution meets the requirements and functions smoothly.
### Challenge:
- Conduct thorough testing of the appointment management system
- Validate that the system performs as intended and is user-friendly.
- Address any issues or enhancements identified during testing.

### Key Considerations:
- Conduct unit testing, integration testing, and system testing.
- Identify and fix bugs and issues.

## Links
* [Lightning Components Library](https://developer.salesforce.com/docs/component-library/overview/components)
* [SLDS Design System - Margins](https://www.lightningdesignsystem.com/utilities/margin/#site-main-content)
* [drawio for design and ERD](https://app.diagrams.net/)
* [Create a Free Salesforce Developer Org](https://developer.salesforce.com/signup)
* [Trailhead - Developer Beginner](https://trailhead.salesforce.com/content/learn/trails/force_com_dev_beginner)
* [Quick Start: Visual Studio Code for Salesforce Development](https://github.com/mmousiou/PawsAndTailsDemo/assets/72067199/62d6de64-809f-48b1-b685-71c462651efd)


## Info
### Authors
  - gitHub: [Maria Mousiou](https://github.com/mmousiou) , email: mmousiou@gmail.com
  - gitHub: [Tina Chrysidou](https://github.com/tinachrysidou), email: tina.chrisidou@gmail.com
