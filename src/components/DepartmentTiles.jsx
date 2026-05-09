import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage } from '../data/products';
import ShopOraImage from './ShopOraImage';

const departments = [
  {
    label: 'Women',
    path: '/women',
    description: 'Dresses, tops, denim, and tailored layers for everyday wear.',
    key: 'women',
  },
  {
    label: 'Men',
    path: '/men',
    description: 'Refined essentials, smart layers, and modern everyday fits.',
    key: 'men',
  },
  {
    label: 'Shoes',
    path: '/shoes',
    description: 'Sneakers, loafers, heels, and boots for the full wardrobe.',
    key: 'shoes',
  },
  {
    label: 'Accessories',
    path: '/accessories',
    description: 'Bags, belts, jewelry, and finishing details in one place.',
    key: 'accessories',
  },
  {
    label: 'Sale',
    path: '/sale',
    description: 'Fresh markdowns across the store.',
    key: 'sale',
  },
];

export default function DepartmentTiles({ products }) {
  const counts = useMemo(
    () =>
      departments.map((department) => {
        const productCount =
          department.key === 'sale'
            ? products.filter((product) => product.isSale).length
            : products.filter((product) => product.department === department.key).length;

        return { ...department, count: productCount };
      }),
    [products],
  );

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <h2>Featured Departments</h2>
          <p>Browse the store by department and jump straight into the strongest edits.</p>
        </div>
      </div>

      <div className="department-grid">
        {counts.map((department) => (
          <Link key={department.key} to={department.path} className="department-tile">
            {(() => {
              const previewProduct =
                department.key === 'sale'
                  ? products.find((product) => product.isSale)
                  : products.find((product) => product.department === department.key);
              const imageProduct = previewProduct ?? products[0];

              return (
                <div className="department-tile-media" aria-hidden="true">
                  <ShopOraImage
                    src={getProductImage(imageProduct)}
                    alt=""
                    className="department-tile-image"
                    fallbackText="ShopOra"
                  />
                </div>
              );
            })()}
            <div className="department-tile-head">
              <span>{department.label}</span>
              <strong>{department.count} styles</strong>
            </div>
            <p>{department.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
