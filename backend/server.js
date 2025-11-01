const express = require('express')

const app = express()
app.use(express.json());

PORT=8090

app.listen(PORT, ()=>{
    console.log(`Aplicatia ruleaza pe port ${PORT}`);
})