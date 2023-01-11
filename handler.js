'use strict';

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "PACIENTES",
};

module.exports.listarPacientes = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    }
  }
  catch (err) {
    console.log("Error: ", err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
};

module.exports.criarPaciente = async (event) => {
  try {
    let dados = JSON.parse(event.body);
    
    const { nome, data_nascimento, email, telefone } = dados 

    const paciente = {
      paciente_id: uuidv4(),
      nome,
      data_nascimento,
      email,
      telefone,
      status: true
    }

    await dynamoDb
      .put({
        TableName: 'PACIENTES',
        Item: paciente,
      })
      .promise();

      return {
        statusCode: 201,

      }
  
  }
  catch (err) {
    console.log("Error: ", err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
};

module.exports.atualizarPaciente = async (event) => {

  const { pacienteId } = event.pathParameters;
  
  try {

      let dados = JSON.parse(event.body);

      const { nome, data_nascimento, email, telefone } = dados

      await dynamoDb
        .update({
          ...params,
          Key: {
            paciente_id: pacienteId
          },
          UpdateExpression:
            'SET nome = :nome, data_nascimento = :dt, email = :email,'
            + 'telefone = :telefone',
            ConditionExpression: 'attribute_exists(paciente_id)',
            ExpressionAttributeValues: {
              ':nome': nome, 
              ':dt': data_nascimento,
              ':email': email,
              ':telefone': telefone
            }
        })
        .promise()
        
        return {
          statusCode: 204,
        };
  
  }
  catch (err) {
    console.log("Error: ", err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
};

module.exports.deletePaciente = async (event) => {

  const { pacienteId } = event.pathParameters;
  
  try {
    
    await dynamoDb
        .delete({
          ...params,
          Key: {
            paciente_id: pacienteId
          },
        })
        .promise()
        
        return {
          statusCode: 202,
        };
  
  }
  catch (err) {
    console.log("Error: ", err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
};

module.exports.listOnePaciente = async (event) => {
  
    try {
      const { pacienteId } = event.pathParameters;
      
      const data = await dynamoDb
        .get({
          ...params,
          Key: {
            paciente_id: pacienteId
          }
        })
        .promise();

        if(!data.Item) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Paciente não existe!' }, null, 2)

          }
        }

        const paciente = data.Item

        return {
          statusCode: 200,
          body: JSON.stringify(paciente, null, 2)
        }
      }
    catch(err) {
      console.log("Error: ", err)
      return {
        statusCode: err.statusCode ? err.statusCode : 500,
        body: JSON.stringify({
          error: err.name ? err.name : 'Exception',
          message: err.message ? err.message : 'Unknown error'
        })
      }
    }
};
