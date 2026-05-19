import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/types";

export function PostForm({
  action,
  post,
  admin = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  post?: BlogPost;
  admin?: boolean;
}) {
  return (
    <form action={action} className="rounded-lg border bg-card p-5 shadow-sm">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <label className="text-sm font-medium" htmlFor={post ? `title-${post.id}` : "title"}>
        Title
      </label>
      <input
        className="mt-2 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={post?.title}
        id={post ? `title-${post.id}` : "title"}
        name="title"
        placeholder="The next big sci-fi sequel to watch"
        required
      />

      <label className="mt-4 block text-sm font-medium" htmlFor={post ? `excerpt-${post.id}` : "excerpt"}>
        Excerpt
      </label>
      <textarea
        className="mt-2 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={post?.excerpt}
        id={post ? `excerpt-${post.id}` : "excerpt"}
        maxLength={220}
        name="excerpt"
        placeholder="A short summary for the blog index."
        required
      />

      <label className="mt-4 block text-sm font-medium" htmlFor={post ? `body-${post.id}` : "body"}>
        Body
      </label>
      <textarea
        className="mt-2 min-h-44 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        defaultValue={post?.body}
        id={post ? `body-${post.id}` : "body"}
        name="body"
        placeholder="Write the post..."
        required
      />

      {admin ? (
        <label className="mt-4 block text-sm font-medium">
          Status
          <select
            className="mt-2 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={post?.status ?? "approved"}
            name="status"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </label>
      ) : null}

      <Button className="mt-5" type="submit">
        {post ? "Save changes" : admin ? "Publish post" : "Submit for review"}
      </Button>
    </form>
  );
}
