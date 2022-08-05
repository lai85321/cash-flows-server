# Cash-Flows

A website that helps users record and split payments, and tracks cash flow.

## Demo Accounts

**Website URL**: https://cash-flows.online/

**Test Accounts**:

- Account 1
  - Email: test1@test.com
  - password: test
- Account 2
  - Email: test2@test.com
  - password: test

## Table of content

- [Feature](https://github.com/lai85321/cash-flows-server#feature)
- [Algorithm](https://github.com/lai85321/cash-flows-server#algorithm)
- [Architecture](https://github.com/lai85321/cash-flows-server#architecture)
- [Database Schema](https://github.com/lai85321/cash-flows-server#database-Schema)
- [Technologies](https://github.com/lai85321/cash-flows-server#technologies)
- [Contact](https://github.com/lai85321/cash-flows-server#contact)

## Feature

- Record payment and split money
  
  - An easy way to record user payments in the same book and split the money accordingly.

https://user-images.githubusercontent.com/42411062/181429141-86e47681-c52a-4087-bae4-b6edd6882f28.mov

- Find an efficient process to exchange money
  
  - Optimized the money exchange process by using a backtracking algorithm to minimize exchange steps.

https://user-images.githubusercontent.com/42411062/181430724-c4da696d-f95b-4f62-8e3b-e6321ef456e0.mov

- Notify relevant users when stakeholders settle the money
  
  - When an order is settled, the relevant user will be notified when the page is refreshed

https://user-images.githubusercontent.com/42411062/181430977-9c6a142e-c5a1-4c26-a494-729742791255.mov

- Display the expense book with the current bill status

  - Show the tag, payment amount, paid user and current bill status.
  
  - The red dot means this bill has not been settled, and green dot means it is settled.
  <img width="1000" alt="account" src="https://user-images.githubusercontent.com/42411062/181431361-37eef3e3-8c56-4667-ac46-8ea91a563aa3.png">

- Plot chart of users' consumption behavior
  - The first chart in the figure is a pie chart which shows the amount spent in different categories.
  
  - The second chart in the figure is a line chart which shows the amount spent every day.
  
  <img width="1000" alt="dashboard" src="https://user-images.githubusercontent.com/42411062/181431332-fb80a6a0-16de-4c08-8bd2-cadd6a79ff89.png">

## Algorithm

#### Utilize this algorithm to optimize the money exchange process
We assume that postive number as the amounts of borrowed money, and the negative number as the amounts of lent money.
If A lent B 100, the status between A and B can be expressed as [-100, 100].
- Psuedo code
  <img width="1000" alt="pseudo" src="https://user-images.githubusercontent.com/42411062/181731148-21dc3e18-594e-4f69-a0e7-834c80cd2ca9.png">

- Example
  <img width="1000" alt="process" src="https://user-images.githubusercontent.com/42411062/182981966-2f8c9631-bac2-4058-9f98-723b7910c223.png">

## Architecture

![](https://i.imgur.com/D8NE9Vk.png)

## Database Schema

![](https://i.imgur.com/5XY6usU.png)

## Technologies

### Back-End

- Node.js
- Express

### Front-End

- React
- CSS
- Chart.js

### Cloud Service (AWS)

- Elastic Compute Cloud (EC2)
- Relational Database Service (RDS)
- Simple Storage Service (S3)
- CloudFront

### Database

- MySQL

### Networking

- Nginx

### Testing

- Mocha
- Chai

### Version Control

- Git
- Github

## Contact

[Tina Lei](https://github.com/lai85321)

Email: weiiting.lei@gmail.com
