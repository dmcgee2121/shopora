import { Link } from 'react-router-dom';

const departments = [
  {
    key: 'women',
    label: 'Women',
    path: '/women',
    description: 'Dresses, tops, tailoring, and polished layers.',
  },
  {
    key: 'men',
    label: 'Men',
    path: '/men',
    description: 'Modern essentials, workwear, and smart casual fits.',
  },
  {
    key: 'shoes',
    label: 'Shoes',
    path: '/shoes',
    description: 'Sneakers, loafers, boots, and occasion-ready pairs.',
  },
  {
    key: 'accessories',
    label: 'Accessories',
    path: '/accessories',
    description: 'Bags, belts, jewelry, and finishing touches.',
  },
  {
    key: 'sale',
    label: 'Sale',
    path: '/sale',
    description: 'Fresh markdowns across the current edit.',
  },
];

export default function DepartmentNav({ products = [] }) {
  return (
    <section className="section-block department-nav-block">
      <div className="section-heading">
        <div>
          <h2>Shop by Department</h2>
          <p>Move quickly into the store's strongest edits and browse by the way you already shop.</p>
        </div>
      </div>

      <div className="department-nav" aria-label="Department navigation">
        {departments.map((department) => {
          const count =
            department.key === 'sale'
              ? products.filter((product) => product.isSale).length
              : products.filter((product) => product.department === department.key).length;

          return (
            <Link key={department.key} to={department.path} className="department-nav-card">
              <div className="department-nav-top">
                <span>{department.label}</span>
                <strong>{count} styles</strong>
              </div>
              <p>{department.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
