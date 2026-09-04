import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { getSmallWorksTemplates } from '../../data/smallWorksTemplates';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './ControlCenterModules.css';
import './EstimatorModule.css';
import './SmallWorksEstimator.css';

export default function EstimatorTemplatesSection() {
  const [templates] = useState(() => getSmallWorksTemplates());

  const groups = useMemo(() => {
    const map = new Map<string, typeof templates>();
    for (const template of templates) {
      const list = map.get(template.category) ?? [];
      list.push(template);
      map.set(template.category, list);
    }
    return [...map.entries()];
  }, [templates]);

  return (
    <div className="cc-page est-page sw-page">
      <EstimatorSubHeader
        title="Estimate Templates"
        subtitle="Create reusable estimate structures for common small works."
      />

      <div className="est-actions sw-templates-actions">
        <Link to="/admin/estimator/templates/new" className="btn btn-primary">
          <span aria-hidden="true">+</span> Create Quotation
        </Link>
      </div>

      <p className="est-note">
        These templates are starting points. Creating a quotation copies the default
        items, scope, payment stages and terms into a fully editable quotation.
      </p>

      {groups.length > 0 ? (
        <div className="sw-template-groups">
          {groups.map(([category, list]) => (
            <section key={category} className="est-panel sw-template-group">
              <h2 className="est-panel-title sw-template-category">{category}</h2>
              <div className="sw-template-list">
                {list.map((template) => (
                  <Link
                    key={template.id}
                    to={`/admin/estimator/templates/${template.id}`}
                    className="sw-template-row"
                  >
                    <span className="sw-template-row-icon" aria-hidden="true">
                      <Icon name="clipboard" size={20} />
                    </span>
                    <span className="sw-template-row-main">
                      <span className="sw-template-row-title">{template.name}</span>
                      <span className="sw-template-row-desc">{template.description}</span>
                    </span>
                    <span className="sw-template-row-count">
                      {template.defaultBoq.length} default BOQ item
                      {template.defaultBoq.length === 1 ? '' : 's'}
                    </span>
                    <span className="sw-template-row-action">
                      Use Template
                      <span className="sw-template-row-arrow" aria-hidden="true">
                        {'\u2192'}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="cc-empty-state">
          <span className="cc-empty-icon" aria-hidden="true">
            <Icon name="clipboard" size={30} />
          </span>
          <h2 className="cc-empty-title">No templates yet</h2>
          <p className="cc-empty-text">Create a new estimate to get started.</p>
        </div>
      )}

      <p className="est-note">
        Templates are stored locally on this device. Changes are not saved to a server.
      </p>
    </div>
  );
}
