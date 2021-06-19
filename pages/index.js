import Head from 'next/head'
import Link from 'next/link'
import { sanityClient, urlFor } from '../lib/sanity'

const recipesQuery = `*[_type == "recipe"]{
  _id,
  name,
  slug,
  mainImage
}
`

export default function Home({ recipes }) {
  return (
    <>
      <Head>
        <title>🍹 Super Smoothies</title>
        <meta name="description" content="Recipe App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome to Super Smoothies!</h1>
      <ul className="recipes-list">
        {recipes?.length > 0 &&
          recipes.map((recipe) => (
            <li key={recipe._id}>
              <Link href={`/recipes/${recipe.slug.current}`}>
                <a className="recipe-card">
                  <img src={urlFor(recipe.mainImage).url()} alt={recipe.name} />
                  <h2>{recipe.name}</h2>
                </a>
              </Link>
            </li>
          ))}
      </ul>
    </>
  )
}

export async function getStaticProps() {
  const recipes = await sanityClient.fetch(recipesQuery)
  return {
    props: {
      recipes,
    },
  }
}
