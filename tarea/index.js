import express from "express";
import fs from "fs"

const app = express()
const port = 8080
app.use(express.urlencoded({extended:true}))
app.use(express.json())

const Productos = "./productos.json"
const Carrito = "./carrito.json"

app.listen(port, () => console.log("Corriendo Servidor"))


app.get("/api/products", async(req,res) => {

    let ProductosJson = await fs.promises.readFile(Productos, "utf-8")
    const Parseado = JSON.parse(ProductosJson)
    res.send(Parseado)

})
app.get("/api/products/limit/:number", (req,res) => {

    const params = req.params.number

    let info = []
    for(let i = 0; Productos.length > i && params > i; i++){
        info.push(Productos[i])
    }
    res.send(info)
})



app.post("/api/products", async(req,res) => {
    const body = req.body
    const ProductosTraidos = await fs.promises.readFile(Productos, "utf-8")

    const parseados = JSON.parse(ProductosTraidos)

    const filtrados = parseados.filter(element => element.id === body.id)

    if(filtrados.length < 1){
        parseados.push(req.body)
        await fs.promises.writeFile(Productos, JSON.stringify(parseados, null, "\t"))

        res.send(parseados)
    }else{
        res.send({status: "Parece que el id ya esta en uso"})
    }

})

app.put("/api/product/modificar/:id", async(req,res) => {

    const params = req.params.id
    const body = req.body
    const ProductosTraidos = await fs.promises.readFile(Productos, "utf-8")

    const parseados = JSON.parse(ProductosTraidos)

    const filtrados = parseados.find(element => element.id == params)
    if(filtrados){

        Object.assign(filtrados, body);
        
        await fs.promises.writeFile(Productos, JSON.stringify(parseados, null,"\t"))

        res.send(filtrados)
    }else{
        res.send("error")
    }


})

app.delete("/api/product/delete/:id", async(req,res) => {

    const params = parseInt(req.params.id)

    const ProductosTraidos = await fs.promises.readFile(Productos, "utf-8")

    const parseados = JSON.parse(ProductosTraidos)

    const filtrados = parseados.filter(element => element.id !== params)

    await fs.promises.writeFile(Productos, JSON.stringify(filtrados, null,"\t" ))

    res.send({status:"Elemento eliminado"})

})

app.post("/agregar/carrito/:id", async(req,res) => {

    const params = parseInt(req.params.id)

    const ProductosTraidos = await fs.promises.readFile(Productos, "utf-8")
    const CarritoTraido = await fs.promises.readFile(Carrito, "utf-8")

    const parseados = JSON.parse(ProductosTraidos)
    const parseadosCarrito = JSON.parse(CarritoTraido)

    const filtrados = parseados.find(element => element.id == params)

    
    let productoEnCarrito = parseadosCarrito.find(element => element.producto === filtrados.id);
    
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {

        let info = {
            id: Math.floor(Math.random() * filtrados.stock),
            cantidad: 1,
            producto: filtrados.id
        };
        parseadosCarrito.push(info);
    }




    await fs.promises.writeFile(Carrito, JSON.stringify(parseadosCarrito, null,"\t" ))

    res.send({status:"Agregado al carrito"})
})



app.get("/mostrar/productos/carrito/:id", async(req,res) => {

    const params = parseInt(req.params.id)


    const ProductosTraidos = await fs.promises.readFile(Carrito, "utf-8")

    const parseados = JSON.parse(ProductosTraidos)

    const filtrados = parseados.find(element => element.id == params)

    res.send(filtrados)

})