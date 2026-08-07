const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const yaml = require('js-yaml');
require('dotenv').config();

const imagesFile = path.join(__dirname, '..', 'images.yml');
const cloudinaryFolder = process.env.CLOUDINARY_LANDSCAPES_FOLDER
  || process.env.CLOUDINARY_LANDSCAPES_PREFIX
  || 'images/landscapes';

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(process.env.CLOUDINARY_URL);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
}

async function fetchAllResources() {
  const resources = [];
  let nextCursor;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 500,
      next_cursor: nextCursor
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

function isLandscapeResource(resource) {
  const folder = (resource.asset_folder || '').toLowerCase();
  const publicId = resource.public_id.toLowerCase();
  const expectedFolder = cloudinaryFolder.toLowerCase().replace(/\/$/, '');
  return folder === expectedFolder || publicId.startsWith(`${expectedFolder}/`);
}

function toPortfolioItem(resource) {
  const title = resource.public_id.split('/').pop();
  return {
    url: resource.secure_url,
    public_id: resource.public_id,
    title,
    caption: resource.context?.custom?.caption || '',
    category: 'landscapes',
    featured: false
  };
}

async function syncLandscapes() {
  configureCloudinary();

  const source = fs.readFileSync(imagesFile, 'utf8');
  const existingItems = yaml.load(source) || [];
  const existingIds = new Set(existingItems.map(item => item.public_id));
  const resources = (await fetchAllResources()).filter(isLandscapeResource);
  const newItems = resources
    .map(toPortfolioItem)
    .filter(item => !existingIds.has(item.public_id));

  if (!newItems.length) {
    console.log(`No new landscape images found under ${cloudinaryFolder}.`);
    return;
  }

  const additions = newItems
    .sort((first, second) => first.public_id.localeCompare(second.public_id))
    .map(item => yaml.dump([item], { lineWidth: -1, noRefs: true }).trim())
    .join('\n');
  const separator = source.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(imagesFile, `${source}${separator}${additions}\n`);
  console.log(`Added ${newItems.length} landscape image${newItems.length === 1 ? '' : 's'} to images.yml.`);
}

syncLandscapes().catch(error => {
  console.error(`Landscape sync failed: ${error.message}`);
  process.exitCode = 1;
});