# Point Cloud Annotation

This is a web application should load and display a LAZ point cloud using Potree. 

The application provides an interface for a user to select any point on the point cloud and attach an annotation.

## Technical Requirements

### 1. Point Cloud Display:

○ Use Potree to load and display a point cloud.

○ You can use the sample point cloud from the Potree annotation example (e.g.,
lion_takanawa): https://potree.org/potree/examples/lion_takanawa.html

○ A good reference for the desired functionality is the official Potree annotations
example: https://github.com/potree/potree/blob/develop/examples/annotations.html

### 2. Annotation Functionality:

○ Create: A user must be able to click on any point in the 3D scene. This action should
create an annotation "marker" at that 3D coordinate.

○ Data: When an annotation is created, the user should be able to attach a simple
string to it (max 256 bytes). This could be done via a simple text input box that
appears.

○ Delete: A user must be able to delete existing annotations.

3. Persistence Layer:

○ Annotations must be saved so they are re-loaded when the page is refreshed.

○ You can choose one of the following implementation tiers. Higher tiers are
considered bonus achievements.

■ Persist the annotation data (coordinates, text) in the browser's localStorage.
in an aws services.

■ Create a serverless backend using AWS Services using API Gateway to trigger a Lambda function that reads/writes from a NoSQL database like DynamoDB.

Deployment:

○ provide clear instructions on how to run the project.

The frontend will be hosted as a static website on an AWS S3 bucket.

○ We want to create a full-stack, cloud-native solution.

○ We want to provide an Infrastructure as Code (IaC) solution to
set up the stack (e.g., using Serverless Framework, AWS CloudFormation, Terraform,
etc.

No authentication is required.

## Implementation notes

The example link: https://potree.org/potree/examples/lion_takanawa.html returns a 404.  It looks like this is a private page now?
