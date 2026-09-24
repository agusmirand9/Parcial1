import {MongoClient, ObjectId} from "mongodb"

const MONGO_URI = process.env.MONGO_URI

const cliente = new MongoClient(MONGO_URI)
const db = cliente.db(process.env.DB_NAME)


const CAMPOS_LIBRO = ["title", "authors", "categories", "thumbnail", "link", "description", "published_year", "average_rating"]


export async function getBooks (filtros = {}) {
    const filter = { eliminado: {$ne: true}}

    const page = parseInt(filtros.page) || 1
    const limit = parseInt(filtros.limit) || 50
    const skip = (page - 1) * limit

    if (filtros?.categories) filter.categories = { $regex: filtros.categories, $options: "i" }
    if (filtros?.title) filter.title = { $regex: filtros.title, $options: "i" }

    const total = await db.collection("libros").countDocuments(filter)
    const libros = await db.collection("libros").find(filter).skip(skip).limit(limit).toArray()
    const totalPaginas = Math.ceil(total / limit)

    return { libros, totalDocumentos: total, totalPaginas }
}


export async function getBookById(id) {
    return await db.collection("libros").findOne(filtroActivo(id))
}


export async function saveBook(libro, clienteId) {
    normalizarLibro(libro)
    libro.eliminado = false
    if (clienteId) {
        const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(clienteId) })
        if (cliente) {
            libro.cliente = { _id: cliente._id, nombre: cliente.nombre, foto: cliente.foto }
        }
    }
    await db.collection("libros").insertOne(libro)
    return libro
}

export async function replaceBook(libro, id, clienteId) {
    normalizarLibro(libro)
    libro.eliminado = false
    if (clienteId) {
        const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(clienteId) })
        if (cliente) libro.cliente = { _id: cliente._id, nombre: cliente.nombre, foto: cliente.foto }
    }
    const resultado = await db.collection("libros").replaceOne(
    filtroActivo(id),       
    libro
)
    if (resultado.matchedCount === 0) return null
    return await getBookById(id)
}

export async function deleteBookLogic(id) {
    const libro = await getBookById(id)     
    if (!libro) return null               
    await db.collection("libros").updateOne(
        filtroActivo(id),
        { $set: { eliminado: true } }
    )
    return libro
}


export async function updateBook(libro, id, clienteId) {
    normalizarLibro(libro)
    if (clienteId) {
        const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(clienteId) })
        if (cliente) libro.cliente = { _id: cliente._id, nombre: cliente.nombre, foto: cliente.foto }
    }
    await db.collection("libros").updateOne(
    filtroActivo(id),         
    { $set: libro }
)
    return await getBookById(id)
}

export async function getBooksByClient(clienteId) {
    const filter = { eliminado: { $ne: true }, "cliente._id": new ObjectId(clienteId) }
    return await db.collection("libros").find(filter).toArray()
}

function normalizarLibro(libro) {
    if (libro.published_year !== undefined) {
        const year = parseInt(libro.published_year)
        libro.published_year = isNaN(year) ? null : year
    }
    if (libro.average_rating !== undefined) {
        const rating = parseFloat(libro.average_rating)
        libro.average_rating = isNaN(rating) ? null : rating
    }
    return libro
}

function filtroActivo(id) {
    return { _id: new ObjectId(id), eliminado: { $ne: true } }
}

export function limpiarLibro(body, { parcial = false } = {}) {
    const libro = {}
    for (const campo of CAMPOS_LIBRO) {
        if (parcial && body[campo] === undefined) continue
        libro[campo] = body[campo]
    }
    return libro
}