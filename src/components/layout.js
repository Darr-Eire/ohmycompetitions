// src/components/Layout.js
import React from 'react'
import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Oh My Competitions</title>
      </Head>
      <header>
        <h1>Oh My Competitions</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>© {new Date().getFullYear()} Oh My Competitions</p>
      </footer>
    </>
  )
}
