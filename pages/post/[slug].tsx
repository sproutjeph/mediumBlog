import { GetStaticProps } from 'next';
import React, { useState } from 'react';
import { Header } from '../../components';
import { urlFor } from '../../lib/sanity';
import { sanityClient } from '../../lib/sanity.server';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import { useForm, SubmitHandler } from 'react-hook-form';
interface Props {
  post: Post;
}

interface IFormInputs {
  _id: string;
  email: string;
  name: string;
  comment: string;
}
const Post = ({ post }: Props) => {
  const [submited, setSubmited] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      const response = await fetch('/api/createComment', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSubmited(true);

      // await response.json();
    } catch (error) {
      console.log(error);
      setSubmited(false);
    }
  };
  return (
    <main>
      <Header />
      <img
        className="object-cover w-full h-80"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-3xl p-5 mx-auto">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>

        <h2 className="mb-2 text-xl font-light text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            src={urlFor(post.author.image).url()!}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <p className="text-sm font-extralight">
            Blog post By{' '}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h1 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a className="text-blue-500 hover:underline">{children}</a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg mx-auto my-5 border-yellow-500 " />

      {submited ? (
        <div className="flex flex-col max-w-2xl p-10 mx-auto text-white bg-yellow-500">
          <h3 className="text-3xl font-bold">Thank You for submiting</h3>
          <p>Once it has been submitted it will be approved</p>
        </div>
      ) : (
        <>
          <form
            className="flex flex-col max-w-2xl p-5 mx-auto mb-10"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h3 className="text-sm text-yellow-500">Enjoy the articel</h3>
            <h4 className="text-3xl font-bold">Leav a comment</h4>

            <hr className="py-3 mt-2" />

            <input
              {...register('_id')}
              type="hidden"
              name="_id"
              value={post._id}
            />

            <label className="mb-5">
              <span className="text-gray-700">Name</span>
              <input
                className="block w-full px-3 py-2 mt-1 rounded shadow form-input ring-yellow-500"
                type="text"
                placeholder="Jeph Applessed"
                {...register('name', { required: true })}
              />
            </label>
            <label className="mb-5">
              <span className="text-gray-700">Email</span>
              <input
                className="block w-full px-3 py-2 mt-1 rounded shadow form-input ring-yellow-500"
                type="email"
                placeholder="Jeph Applessed"
                {...register('email', { required: true })}
              />
            </label>
            <label className="mb-5">
              <span className="text-gray-700">Comments</span>
              <textarea
                className="block w-full px-3 py-2 mt-1 border rounded shadow form-textarea ring-yellow-500 ring focus:ring"
                rows={8}
                placeholder="Jeph Applessed"
                {...register('comment', { required: true })}
              />
            </label>

            <div className="flex flex-col p-5">
              {errors.name && (
                <span className="text-red-500">Name is required</span>
              )}
              {errors.email && (
                <span className="text-red-500">The Email is required</span>
              )}
              {errors.comment && (
                <span className="text-red-500">The Comment is required</span>
              )}
            </div>

            <input
              type="submit"
              className="px-4 py-2 font-bold text-white bg-yellow-500 rounded shadow cursor-pointer hover:bg-yellow-400 focus:shadow-outline focus:outline-none"
            />
          </form>

          <div className="flex flex-col max-w-2xl p-10 mx-auto my-10 space-y-2 shadow shadow-yellow-500">
            <h3 className="text-4xl">Comments</h3>
            <hr className="pb-2" />

            {post.comments.map((comment) => {
              return (
                <div key={comment._id}>
                  <p>
                    <span className="text-yellow-500">{comment.name}: </span>
                    <span className="ml-2 font-sans capitalize">
                      {comment.comment}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
};

export default Post;

export async function getStaticPaths() {
  const query = `*[_type == 'post']{
  _id,
  slug{
   current
  }
 }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == 'post' && slug.current == $slug][0]{
 _id,
 _createdAt,
 title,
 author->{
  name,
  image,

 },
 'comments': *[
   _type == "comment" &&
    post._ref == ^._id && 
    approved == true
 ],
 description,
 mainImage,
 slug,
 body
}`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: { post },
    revalidate: 60,
  };
};