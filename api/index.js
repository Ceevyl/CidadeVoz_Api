const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const pool = new Pool({
    user: "postgres",
    host: "containers-us-west-71.railway.app",
    database: "railway",
    password: "03xjK0maOGqrklqA4t83",
    port: 6863
})

const ActualData = 2020;

app.get("/", (req, res) => {
    res.send("Gerenciador Oficial do CidadeVoz < Developed By Ceevyl ! >")
})
// --------------------------------------------------------------------------




// --------------------------------- LOGIN / Register -----------------------------------------

app.get("/getUserByCPF/:cpf", (req, res) => {

    const cpf = req.params.cpf;

    const _bool = HasRegister(cpf);

    _bool.then( ( resposta ) => {

        res.json( resposta.rows[0] ) 

    } ).catch( (error) => {

        res.send("Usuário Não Encontrado")

    } )

});

app.get("/getAll", (req, res) => {

    pool.query("SELECT * FROM registro", ( err, response ) => {
        
        res.json( response.rows )

    })

})

// --------------------------------- LOGIN / Register -----------------------------------------

  // Exemplo de inserção
  const insertData = async ( cpf, data ) => {
    try {

      const query = 'INSERT INTO registro (cpf, person_config) VALUES ($1, $2)';
      const values = [cpf, data];
  
      const result = await pool.query(query, values);

      console.log('Inserção realizada com sucesso!');

    } catch ( error ) {

        console.log(error)

    }
  };

app.post("/register", (req, res) => {

    const { CPF, MyData } = req.body;

    const _has = HasRegister(CPF);

    _has.then((response)=>{

        if (response.rows.length == 0) {

            insertData(CPF, MyData)

            res.json({message: "Inserido Com Sucesso"})
            
        }else {

            res.json({message: "Usuário ja Existente"})
    
            return;
            
        }

    })

})

app.post("/addvereadortoperiodo", async (req, res) => {
    const { MyData, CPF } = req.body;

    const insertVereador = async (cpf, MyData) => {
        try {
            const Verified = await pool.query("SELECT vereadores FROM periodos WHERE ano = $1", [ActualData]);
            const OldData = Verified.rows[0]['vereadores'];

            const Payload = {
                Cpf: cpf,
                Nome: MyData['Nome'] || "N/A",
                Partido: "N/A",
                Imagem: "N/A"
            }

            OldData.push(Payload);

            await pool.query("UPDATE periodos SET vereadores = $1 WHERE ano = $2", [JSON.stringify(OldData), ActualData]);

            return;
        } catch (error) {
            throw error;
        }
    }

    try {
        await insertVereador(CPF, MyData);
        res.send("Absorvido Com Sucesso");
    } catch (error) {
        res.status(500).send(error);
    }
});

// --------------------------------- Periodos -----------------------------------------

app.get("/Periodos", (req, res) => {

    pool.query("SELECT * FROM periodos", (err, response) => {

        response.rows.sort( (a,b) => b.ano - a.ano )

        res.json(response.rows)
    })

})

app.get("/getVereadores", async (req, res) => {
    try {
        const response = await pool.query("SELECT vereadores FROM periodos WHERE ano = $1", [ActualData]);
        res.json(response.rows[0].vereadores);
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter vereadores" });
    }
});


// --------------------------------- Periodos -----------------------------------------

app.post("/updateSenha", async (req, res) => {
    const { myData } = req.body;
    try {
        const response = await pool.query("UPDATE registro SET person_config = $1 WHERE cpf = $2", [JSON.stringify(myData.person_config), myData.cpf])
        res.send(response)
    } catch(err) {
        res.send(err)
    }
  });

// useful functions


const HasRegister = ( cpf ) => {

    return pool.query("SELECT * FROM registro WHERE cpf = $1", [cpf] )

}





app.listen(3000);