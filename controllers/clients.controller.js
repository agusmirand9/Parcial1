import * as clientService from "../services/clients.service.js"
import * as bookService from "../services/books.service.js"
import * as clientView from "../views/clients.view.js"
import { ObjectId } from "mongodb"

export async function getClients(req, res) {
    try {
        const clientes = await clientService.getClients()
        res.send(clientView.createClientsPage(clientes))
    } catch (error) {
        console.error(error)
        res.status(500).send(clientView.pageError(500, "Error interno del servidor"))
    }
}

export function newClientForm(req, res) {
    try {
        res.send(clientView.newClientForm())
    } catch (error) {
        console.error(error)
        res.status(500).send(clientView.pageError(500, "Error interno del servidor"))
    }
}

export async function saveClient(req, res) {
    try {
        const { nombre, foto, descripcion } = req.body
        await clientService.saveClient({ nombre, foto, descripcion })
        res.redirect("/clientes")
    } catch (error) {
        console.error(error)
        res.status(500).send(clientView.pageError(500, "Error interno del servidor"))
    }
}

export async function getClientBooks(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(clientView.pageError(404, "Cliente no encontrado"))

        const cliente = await clientService.getClientById(id)
        if (!cliente) return res.status(404).send(clientView.pageError(404, "Cliente no encontrado"))
        const libros = await bookService.getBooksByClient(id)
        res.send(clientView.createClientBooksPage(cliente, libros))
    } catch (error) {
        console.error(error)
        res.status(500).send(clientView.pageError(500, "Error interno del servidor"))
    }
}