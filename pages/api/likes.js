import { sanityClient } from '../../lib/sanity'

sanityClient.config({
  token: process.env.SANITY_WRITE_TOKEN,
})

export default async function likeButtonHandler(req, res) {
  const { _id } = JSON.parse(req.body)
  const data = await sanityClient
    .patch(_id)
    .setIfMissing({ likes: 0 })
    .inc({ likes: 1 })
    .commit()
    .catch((e) => console.error(e))

  res.status(200).json({ likes: data.likes })
}
