import { useState } from 'react'
import {
  sanityClient,
  urlFor,
  usePreviewSubscription,
  PortableText,
} from '../../lib/sanity'

const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  mainImage,
  ingredient[]{
    _key,
    unit,
    wholeNumber,
    fraction,
    ingredient->{
      name
    }
  },
  instructions,
  likes
}`

export default function OneRecipe({ data, preview }) {
  // side by side you can see live preview of stuff changed in sanity studio
  const { data: recipe } = usePreviewSubscription(recipeQuery, {
    params: { slug: data.recipe?.slug.current },
    initialData: data,
    enabled: preview,
  })

  const [likes, setLikes] = useState(data?.recipe?.likes)
  const addLike = async () => {
    const res = await fetch('/api/likes', {
      method: 'POST',
      body: JSON.stringify({ _id: recipe._id }),
    }).catch((e) => console.error(e))

    const data = await res.json()

    setLikes(data.likes)
  }

  if (!data) return <h1 style="text-align: center;">Loading...</h1>
  return (
    <article>
      <h1>{recipe.name}</h1>
      <button className="likes" onClick={addLike}>
        {likes} 💖
      </button>
      <section className="recipe-card">
        <img src={urlFor(recipe?.mainImage)} alt={recipe.name} />
        <ul className="ingredients">
          {recipe.ingredient?.map((ingredient) => (
            <li key={ingredient._key} className="ingredient">
              <span>{ingredient?.wholeNumber}</span>
              <span className="diagonal">
                {ingredient?.fraction}
                {/* <sup>{ingredient?.fraction.slice(0, 1)}</sup>/
                  <sub>{ingredient?.fraction.slice(-1)}</sub> */}
              </span>
              <span>{ingredient?.unit}</span>
              <span>{ingredient?.ingredient?.name}</span>
            </li>
          ))}
        </ul>
        <h2>Instructions</h2>
        <PortableText blocks={recipe?.instructions} />
      </section>
    </article>
  )
}

export async function getStaticPaths() {
  const paths = await sanityClient.fetch(
    `*[_type == "recipe" && defined(slug.current)]{
      "params": {
        "slug": slug.current
      }
    }`
  )

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  // slug matches with file name [slug].js
  const { slug } = params
  // 2nd argument matches slug param from groq query
  const recipe = await sanityClient.fetch(recipeQuery, { slug })
  return { props: { data: { recipe }, preview: true } }
}
