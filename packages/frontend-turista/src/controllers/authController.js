const pool = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND rol IN ($2, $3)',
      [email, 'admin', 'guia']
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const user = result.rows[0]

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    )

    // No enviar password_hash
    delete user.password_hash

    res.json({ token, user })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const verificarToken = async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, nombre, rol FROM usuarios WHERE id = $1',
      [req.userId]
    )
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ user: user.rows[0] })
  } catch (error) {
    console.error('Error verificando token:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  login,
  verificarToken,
}