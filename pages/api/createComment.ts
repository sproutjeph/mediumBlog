import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../../lib/sanity.server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { _id, name, email, comment } = req.body;

    try {
      await sanityClient.create({
        _type: 'comment',
        post: {
          _type: 'reference',
          _ref: _id,
        },
        name,
        email,
        comment,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Cant Submit comment', error });
    }

    res.status(200).json({ message: 'Comment submited' });
  }
}
