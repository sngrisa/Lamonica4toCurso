var Bicicleta = require('../../models/bicicleta');
var request = require('request');
var server = require('../../bin/www');

describe(' Bicicleta API', () =>{
    describe('GET BICICLETAS /', () =>{
        it('Status 200', ()=>{
            expect(Bicicleta.allBicis.length).toBe(1);
            var a =new Bicicleta(1,'rojo','urbana', [21.844862, -102.254499]);
            Bicicleta.add(a);//adding a bicicleta
            request.get('http://localhost:3000/api/bicicletas',function(error, response, body){
                expect(response.statusCode).toBe(200);
            });

        });
    });
});


describe('POST BICICLETAS/create', () =>{
   it('STATUS 200', (done)=>{
       var headers ={'content-type':'application/json'};
       var aBici= '{"id": 100 , "color":"rojo", "modelo":"pista", "lat":-34, "lng":-55 }';
       request.post({
           headers:headers,
           url: 'http://localhost:3000/api/bicicletas/create',
           body: aBici
       },function(error,response,body){
           expect(response.statusCode).toBe(200);
           expect(response.statusCode).toBe(200);

           done();
       });
   });
});