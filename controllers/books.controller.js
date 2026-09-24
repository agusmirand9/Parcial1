import * as bookService from "../services/books.service.js"
import * as clientService from "../services/clients.service.js"
import * as bookView from "../views/books.view.js"
import { ObjectId } from "mongodb"


export async function getBooks(req, res) {
    try {
        const filtros = req.query
        const resultado = await bookService.getBooks(filtros)
        res.send(bookView.createBooksPage(resultado, filtros))
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}


export async function getBookById(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))

        const libro = await bookService.getBookById(id)
        if (!libro) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))
        const volver = req.query.volver || "/libros"
        res.send(bookView.createDetailPage(libro, volver))
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}


export async function newBookForm(req, res) {
    try {
        const clientes = await clientService.getClients()
        res.send(bookView.newBookForm(clientes))
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}

export async function saveBook(req, res) {
    try {
        const { clienteId, ...body } = req.body
        const libro = bookService.limpiarLibro(body)
        const nuevoLibro = await bookService.saveBook(libro, clienteId)
        res.redirect(`/libros/${nuevoLibro._id}`)
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}

export async function editBookForm(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))

        const libro = await bookService.getBookById(id)
        if (!libro) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))
        const clientes = await clientService.getClients()
        res.send(bookView.editBookForm(libro, clientes))
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}

export async function editBook(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))

        const { clienteId, ...body } = req.body
        const libro = bookService.limpiarLibro(body)
        const libroActualizado = await bookService.replaceBook(libro, id, clienteId)
        if (!libroActualizado) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))
        res.redirect(`/libros/${id}`)
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}


export async function deleteBookForm(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))

        const libro = await bookService.getBookById(id)
        if (!libro) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))
        res.send(bookView.deleteBookForm(libro))
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}

export async function deleteBook(req, res) {
    try {
        const id = req.params.id
        if (!ObjectId.isValid(id)) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))

        const libro = await bookService.deleteBookLogic(id)
        if (!libro) return res.status(404).send(bookView.pageError(404, "Libro no encontrado"))
        res.redirect("/libros")
    } catch (error) {
        console.error(error)
        res.status(500).send(bookView.pageError(500, "Error interno del servidor"))
    }
}