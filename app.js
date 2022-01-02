const express = require('express');
const app = express();

//nodemon and concurrently are dev dependencies
//other packages installed are regular dependencies


app.get('/', (req,res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));