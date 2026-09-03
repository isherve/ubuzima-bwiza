import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EDITABLE_FIELDS, LOCALES, type AppLocale } from '../../i18n/config'
import { useContent } from '../../context/ContentContext'

export function AdminContentPage() {
  const {
    text,
    getLocalizedField,
    setLocalizedField,
    saveOverrides,
    resetOverrides,
    savedNotice,
    clearSavedNotice,
  } = useContent()
  const { t } = useTranslation()

  const sections = useMemo(
    () => [...new Set(EDITABLE_FIELDS.map((field) => field.section))],
    [],
  )
  const [section, setSection] = useState(sections[0] ?? 'Home')
  const [activeKey, setActiveKey] = useState(
    EDITABLE_FIELDS.find((field) => field.section === section)?.key ?? EDITABLE_FIELDS[0]?.key,
  )

  const fields = EDITABLE_FIELDS.filter((field) => field.section === section)
  const activeField = fields.find((field) => field.key === activeKey) ?? fields[0]

  const onSectionChange = (next: string) => {
    setSection(next)
    const first = EDITABLE_FIELDS.find((field) => field.section === next)
    if (first) setActiveKey(first.key)
  }

  const onEdit = (locale: AppLocale, value: string) => {
    if (!activeField) return
    const current = getLocalizedField(activeField.key)
    setLocalizedField(activeField.key, { ...current, [locale]: value })
  }

  return (
    <div className="stack cms-page">
      <div>
        <h2>{text('admin.contentTitle')}</h2>
        <p className="lead">{text('admin.contentLead')}</p>
      </div>

      {savedNotice && (
        <div className="success cms-notice">
          {t('common.saved')}
          <button type="button" className="cms-notice-close" onClick={clearSavedNotice}>
            Close
          </button>
        </div>
      )}

      <div className="cms-toolbar">
        <label className="field cms-field-inline">
          <span>{text('admin.selectSection')}</span>
          <select value={section} onChange={(e) => onSectionChange(e.target.value)}>
            {sections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field cms-field-inline">
          <span>{text('admin.fieldLabel')}</span>
          <select value={activeField?.key ?? ''} onChange={(e) => setActiveKey(e.target.value)}>
            {fields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
        </label>
        <div className="cms-actions">
          <button type="button" className="btn btn-primary" onClick={saveOverrides}>
            {t('common.save')}
          </button>
          <button type="button" className="btn btn-outline" onClick={resetOverrides}>
            {t('common.reset')}
          </button>
        </div>
      </div>

      {activeField && (
        <div className="cms-editor">
          {LOCALES.map((loc) => {
            const values = getLocalizedField(activeField.key)
            return (
              <div className="field" key={loc.code}>
                <label htmlFor={`${activeField.key}-${loc.code}`}>{loc.label}</label>
                {activeField.multiline ? (
                  <textarea
                    id={`${activeField.key}-${loc.code}`}
                    rows={5}
                    value={values[loc.code]}
                    onChange={(e) => onEdit(loc.code, e.target.value)}
                  />
                ) : (
                  <input
                    id={`${activeField.key}-${loc.code}`}
                    value={values[loc.code]}
                    onChange={(e) => onEdit(loc.code, e.target.value)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="feature">
        <h3>{text('announcement.title')}</h3>
        <p>{text('announcement.body')}</p>
      </div>
    </div>
  )
}
