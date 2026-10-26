'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { BlogPost } from '@/types/common';
import { blogBodyMap } from '@/data/blog-content';

/* ── Icons ── */
function IcoFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" />
    </svg>
  );
}
function IcoShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.0001 9.00015V2.00015L21.0001 10.0001L13.0001 18.0001V10.9501C8.00011 10.9501 4.50011 12.5001 2.00011 16.0001C3.00011 11.0001 6.00011 6.00015 13.0001 9.00015Z" />
    </svg>
  );
}
function IcoArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z" />
    </svg>
  );
}
function IcoArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
    </svg>
  );
}

function formatDate(dateStr: string) {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

interface Props {
  post: BlogPost;
  prevPost: BlogPost | null;
  nextPost: BlogPost | null;
}

export function BlogDetailContent({ post, prevPost, nextPost }: Props) {
  const [name, setName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [comment, setComment] = useState('');

  const body = blogBodyMap[post.slug];

  return (
    <>
      {/* ── Hero image — full-bleed, 710px ── */}
      <div className="bd-hero">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* ── Content ── */}
      <div className="container-main pt-[40px] pb-[80px]">
        <div className="bd-content">

          {/* Title + date */}
          <h1 className="bd-title">{post.title}</h1>
          <p className="bd-date">{formatDate(post.date)}</p>

          {/* Body */}
          <div className="bd-body">
            {body ? (
              <>
                {body.intro && (
                  <p className="bd-body-text">{body.intro}</p>
                )}
                {body.bullets && body.bullets.length > 0 && (
                  <ul className="bd-bullets">
                    {body.bullets.map((b, i) => (
                      <li key={i} className="bd-bullet">
                        <strong>{b.label}:</strong> {b.text}
                      </li>
                    ))}
                  </ul>
                )}
                {body.outro && (
                  <p className="bd-body-text">{body.outro}</p>
                )}
              </>
            ) : (
              <p className="bd-body-text">{post.excerpt}</p>
            )}
          </div>

          {/* ── Social share ── */}
          <hr className="bd-divider" />
          <div className="bd-social">
            <button className="bd-social-btn" type="button" aria-label="Share on Facebook">
              <IcoFacebook /> Facebook
            </button>
            <button className="bd-social-btn" type="button" aria-label="Share">
              <IcoShare /> Share
            </button>
          </div>

          {/* ── Prev / Next ── */}
          <hr className="bd-divider" />
          <div className="bd-nav">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="bd-nav-link">
                <IcoArrowLeft /> Previous
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="bd-nav-link">
                Next <IcoArrowRight />
              </Link>
            ) : (
              <span />
            )}
          </div>

          {/* ── Back to blog ── */}
          <hr className="bd-divider" />
          <div className="bd-back">
            <Link href="/blog" className="bd-back-link">
              <IcoArrowLeft /> Back to blog
            </Link>
          </div>

          {/* ── Leave a comment ── */}
          <div className="bd-comment-section">
            <h2 className="bd-comment-heading">Leave a comment</h2>
            <form className="bd-comment-form" onSubmit={(e) => e.preventDefault()}>
              <div className="bd-comment-row">
                <input
                  type="text"
                  placeholder="Name*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bd-input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email*"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="bd-input"
                  required
                />
              </div>
              <textarea
                placeholder="Comment*"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bd-textarea"
                rows={4}
                required
              />
              <p className="bd-notice">
                Please note, comments need to be approved before they are published.
              </p>
              <div>
                <button type="submit" className="bd-submit">Post comment</button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <style>{bdStyles}</style>
    </>
  );
}

/* ── Styles ── */
const bdStyles = `
  /* ── Hero ── */
  .bd-hero {
    position: relative;
    width: 100%;
    height: 710px;
    overflow: hidden;
    background: #f0f0f0;
  }

  /* ── Content wrapper ── */
  .bd-content {
    max-width: 780px;
    margin: 0 auto;
  }

  /* ── Title ── */
  .bd-title {
    font-size: 3.4rem;
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.3;
    margin-bottom: 0.8rem;
  }

  /* ── Date ── */
  .bd-date {
    font-size: 1.4rem;
    color: #999;
    margin-bottom: 2.4rem;
  }

  /* ── Body text ── */
  .bd-body { margin-bottom: 0.4rem; }
  .bd-body-text {
    font-size: 1.5rem;
    color: #555;
    line-height: 1.75;
    margin-bottom: 1.6rem;
  }

  /* ── Bullet list ── */
  .bd-bullets {
    list-style: disc;
    padding-left: 2rem;
    margin-bottom: 1.6rem;
  }
  .bd-bullet {
    font-size: 1.5rem;
    color: #555;
    line-height: 1.65;
    margin-bottom: 0.8rem;
  }
  .bd-bullet:last-child { margin-bottom: 0; }
  .bd-bullet strong {
    color: var(--color-heading);
    font-weight: 600;
  }

  /* ── Divider ── */
  .bd-divider {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 2.8rem 0;
  }

  /* ── Social share ── */
  .bd-social {
    display: flex;
    align-items: center;
    gap: 2.4rem;
    flex-wrap: wrap;
  }
  .bd-social-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
    color: #555;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    transition: color 0.2s;
  }
  .bd-social-btn:hover { color: #111; }

  /* ── Prev / Next navigation ── */
  .bd-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
  }
  .bd-nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.45rem;
    color: var(--color-heading);
    text-decoration: none;
    transition: color 0.2s;
  }
  .bd-nav-link:hover { color: #666; }

  /* ── Back to blog ── */
  .bd-back {
    text-align: center;
    margin-bottom: 0.8rem;
  }
  .bd-back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.45rem;
    color: var(--color-heading);
    text-decoration: none;
    transition: color 0.2s;
  }
  .bd-back-link:hover { color: #666; }

  /* ── Comment section ── */
  .bd-comment-section { margin-top: 0.8rem; }
  .bd-comment-heading {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 2.4rem;
  }
  .bd-comment-form {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
  }
  .bd-comment-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;
  }
  .bd-input {
    width: 100%;
    height: 4.8rem;
    border: 1px solid #d5d5d5;
    border-radius: 0.3rem;
    padding: 0 1.4rem;
    font-size: 1.4rem;
    color: var(--color-heading);
    background: #fff;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .bd-input:focus { border-color: #888; }
  .bd-input::placeholder { color: #bbb; }
  .bd-textarea {
    width: 100%;
    min-height: 12rem;
    border: 1px solid #d5d5d5;
    border-radius: 0.3rem;
    padding: 1.2rem 1.4rem;
    font-size: 1.4rem;
    color: var(--color-heading);
    background: #fff;
    outline: none;
    font-family: inherit;
    resize: vertical;
    line-height: 1.6;
    transition: border-color 0.2s;
  }
  .bd-textarea:focus { border-color: #888; }
  .bd-textarea::placeholder { color: #bbb; }
  .bd-notice {
    font-size: 1.3rem;
    color: #999;
    line-height: 1.5;
    margin-top: -0.4rem;
  }
  .bd-submit {
    background: #111;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    height: 5rem;
    padding: 0 3.2rem;
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.01em;
    transition: background 0.2s;
  }
  .bd-submit:hover { background: #333; }

  /* ── Responsive ── */
  @media (max-width: 749px) {
    .bd-hero { height: 300px; }
    .bd-title { font-size: 2.4rem; }
    .bd-comment-row { grid-template-columns: 1fr; }
  }
  @media (min-width: 750px) and (max-width: 991px) {
    .bd-hero { height: 480px; }
    .bd-title { font-size: 2.8rem; }
  }
`;
