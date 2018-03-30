const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public');

let app = express();

app.use(express.static(PublicPath));

app.listen(port, ()  => {
  console.log(`server up on port ${port}`);
});
