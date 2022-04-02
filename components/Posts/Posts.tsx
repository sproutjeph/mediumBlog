import Link from 'next/link';
import React from 'react';
import { Post } from '../../typings';
import { urlFor } from '../../lib/sanity';
interface Props {
  post: Post;
}

const Posts = ({ post }: Props) => {
  return (
    <Link href={`/post/${post.slug.current}`}>
      <div className="max-w-[320px] group cursor-pointer border rouned-lg overflow-hiden">
        <img
          className=" h-60 w-full object-cover group-hover:scale-105 transistion-transform duration-200 ease-in-out  "
          src={urlFor(post.mainImage).url()}
          alt="first post pics"
        />

        <div className="flex justify-between p-5 bg-white">
          <div>
            <p className="text-lg font-bold">{post.title}</p>
            <p className="text-xs">
              {post.description} by {post.author?.name.slice(0, 4)}
            </p>
          </div>
          <img
            className="h-12 w-12 rounded-full"
            src={urlFor(post.author?.image).url()}
            alt="author pic"
          />
        </div>
      </div>
    </Link>
  );
};

export default Posts;
