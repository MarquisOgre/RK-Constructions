<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the RK Constructions marketing experience on the home route with local illustrative listings and generated photography; no project data service was provided.
- Use the supplied logo through a Lovable Assets pointer and the supplied RK icon as a compact local favicon; this keeps the brand consistent without storing the full uploaded image in source.
- Keep development content in the shared local property catalogue and label unit, amenity, specification, pricing, and imagery details as illustrative because no live inventory source exists.
- Store public callback requests through a validated server function in the private Cloud table; never expose lead rows to browsers.
- Run property matching through the server-side Lovable AI Gateway and restrict results to slugs from the local catalogue.
- Developments live in the `properties` table (owner-editable via dashboard); `src/lib/properties.ts` only maps rows and local fallback images. Why: owner manages listings without code changes.
- Inquiry replies are stored in `inquiry_replies` (service-role insert after admin check). Why: reply history per inquiry, independent of email delivery.
