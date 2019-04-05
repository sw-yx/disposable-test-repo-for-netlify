import React, { useState } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

// 0 dependency axios clone with fauna endpoint baked in
const xios = {
  get: _xios("GET"),
  post: _xios("POST"),
  put: _xios("PUT"),
  delete: _xios("DELETE"),
}

/** main page layout */
export default function Guestbook(props) {
  const { data } = props
  const siteTitle = data.site.siteMetadata.title

  const [messages, setMessages] = React.useState([])
  const [status, setStatus] = useState(null)

  const refresh = () => {
    setStatus([true, "loading..."])
    return xios
      .get()
      .then(x => {
        console.log(x) || setMessages(x.reverse())
      })
      .then(() => setStatus(null))
  }
  const deleteMsg = ref => () => {
    setStatus([true, "deleting..."])
    xios
      .delete(ref["@ref"].id)
      .then(refresh)
      .then(() => setStatus(null))
      .catch(err => {
        throw new Error(err)
      })
  }
  React.useEffect(() => void injectStyle(), [])
  React.useEffect(() => void refresh(), [])
  return (
    <Layout location={props.location} title={siteTitle}>
      <div style={{ transition: "all 0.5s" }}>
        <SEO title="Guestbook" />
        <h1>Guestbook: LIVE!!!!</h1>
        <p>leave a message after the tone!</p>
        {!messages.length ? (
          <Pre> Guestbook is empty! Say something! </Pre>
        ) : (
          <div>
            {messages.map(({ data: { name, message }, ref }, i) => {
              return (
                <Comment
                  key={i}
                  {...{ name, message, handler: deleteMsg(ref) }}
                />
              )
            })}
          </div>
        )}
        {status &&
          (status[0] /** loading or error state */ ? (
            <Spinner />
          ) : (
            <div>
              <Pre>{status[1]}</Pre>
            </div>
          ))}
        <CommentForm {...{ refresh, setStatus }} />
      </div>
    </Layout>
  )
}

/** main form component */
function CommentForm({ refresh, setStatus }) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  const handler = e => {
    e.preventDefault()
    setName("") || setMessage("") || setStatus([true, "submitting..."])
    xios
      .post("", { body: JSON.stringify({ name, message }) })
      .then(() => setStatus([true, "success!"]))
      .then(refresh)
      .then(() => setStatus(null))
      .catch(err => setStatus([false, "failed!"]))
  }
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <form
        onSubmit={handler}
        style={{
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        <label style={{ marginBottom: 20 }}>
          <div>Name:</div>
          <NiceInput
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label style={{ marginBottom: 20 }}>
          <div>Message:</div>
          <NiceInput
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </label>
        <button style={{ background: "palegoldenrod", borderRadius: 5 }}>
          Submit
        </button>
      </form>
    </div>
  )
}

/**
 *
 * EVERYTHING BELOW IS MINOR DETAILS
 *
 */

/** gatsby doing its thing */
export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

/** just some styled components */
function Comment({ name, message, handler }) {
  return (
    <div>
      <blockquote
        style={{
          background: "rgba(100,200,200,0.1)",
          marginLeft: 0,
          padding: "10px 30px",
        }}
      >
        {message}
        <div style={{ textAlign: "right", fontStyle: "normal" }}>
          <b>{name}</b>
          <button
            style={{
              border: 0,
              cursor: "pointer",
              background: "palegoldenrod",
              borderRadius: 5,
              margin: 10,
            }}
            onClick={handler}
          >
            x
          </button>
        </div>
      </blockquote>
    </div>
  )
}

function Pre({ children }) {
  return (
    <pre
      style={{
        background: "rgba(20,80,80,0.4)",
        borderRadius: 10,
        padding: 10,
      }}
    >
      {children}
    </pre>
  )
}

function NiceInput(props) {
  return (
    <input
      {...props}
      style={{
        background: "rgba(0,0,0,0.15)",
        border: "none",
        borderRadius: 10,
        padding: "5px 10px",
      }}
    />
  )
}
/** lets have a nice spinner http://tobiasahlin.com/spinkit/ */
function Spinner() {
  return (
    <div className="spinner">
      <div className="rect1" />
      <div className="rect2" />
      <div className="rect3" />
      <div className="rect4" />
      <div className="rect5" />
    </div>
  )
}
function injectStyle() {
  const styleElement = document.createElement("style")
  let styleSheet = null
  document.head.appendChild(styleElement)
  styleSheet = styleElement.sheet
  const styles = `
  .spinner {
    top: 0;
    left: 0;
    position: fixed;
    width: 100vw;
    height: 100%;
    background: rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  //
  .spinner > div {
    background-color: #333;
    height: 40px;
    width: 6px;
    display: inline-block;
    -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
    animation: sk-stretchdelay 1.2s infinite ease-in-out;
  }
  //
  .spinner .rect2 {
    -webkit-animation-delay: -1.1s;
    animation-delay: -1.1s;
  }
  //
  .spinner .rect3 {
    -webkit-animation-delay: -1.0s;
    animation-delay: -1.0s;
  }
  //
  .spinner .rect4 {
    -webkit-animation-delay: -0.9s;
    animation-delay: -0.9s;
  }
  //
  .spinner .rect5 {
    -webkit-animation-delay: -0.8s;
    animation-delay: -0.8s;
  }
  //
  @-webkit-keyframes sk-stretchdelay {
    0%, 40%, 100% { -webkit-transform: scaleY(0.4) }  
    20% { -webkit-transform: scaleY(1.0) }
  }
  //
  @keyframes sk-stretchdelay {
    0%, 40%, 100% { 
      transform: scaleY(0.4);
      -webkit-transform: scaleY(0.4);
    }  20% { 
      transform: scaleY(1.0);
      -webkit-transform: scaleY(1.0);
    }
  }
  `
  styles
    .split("//")
    .forEach(style => styleSheet.insertRule(style, styleSheet.cssRules.length))
}

/** just a nice wrapper over fetch */
function _xios(method) {
  return (endpoint = "", obj = {}) => {
    endpoint = "/.netlify/functions/fauna/" + endpoint // bake in the endpoint
    const defaultObj = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
    const finalObj = Object.assign(defaultObj, { method }, obj)
    return fetch(endpoint, finalObj).then(res =>
      finalObj.headers["Content-Type"] === "application/json" ? res.json() : res
    )
  }
}
