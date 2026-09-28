import { useState, type FormEvent } from 'react';
import { AvatarPicker } from '../../components/AvatarPicker';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { inputClass, TextField } from '../../components/Field';
import { Sheet } from '../../components/Sheet';
import { findDuplicate, nextAvatar, normalizeName, personUsage } from '../../lib/people';
import {
  LIMITS,
  PAYMENT_METHODS,
  type KkbEvent,
  type PaymentMethod,
  type Person,
} from '../../lib/schema';
import { useKkbStore } from '../../store/useKkbStore';

/** Add a person (`personId === 'new'`) or edit one: name, avatar and payment handle. */
export function PersonSheet({
  event,
  personId,
  onClose,
}: {
  event: KkbEvent;
  personId: string | null;
  onClose: () => void;
}) {
  const person = event.people.find((p) => p.id === personId);
  const open = personId === 'new' || Boolean(person);
  return (
    <Sheet open={open} onClose={onClose} title={person ? `Edit ${person.name}` : 'Add person'}>
      {open && <PersonForm key={personId} event={event} person={person} onDone={onClose} />}
    </Sheet>
  );
}

function PersonForm({
  event,
  person,
  onDone,
}: {
  event: KkbEvent;
  person: Person | undefined;
  onDone: () => void;
}) {
  const addPerson = useKkbStore((s) => s.addPerson);
  const updatePerson = useKkbStore((s) => s.updatePerson);
  const removePerson = useKkbStore((s) => s.removePerson);
  const initial = person ?? { name: '', ...nextAvatar(event.people) };
  const [name, setName] = useState(initial.name);
  const [avatar, setAvatar] = useState({ emoji: initial.emoji, color: initial.color });
  const [method, setMethod] = useState<PaymentMethod | ''>(person?.payment?.method ?? '');
  const [value, setValue] = useState(person?.payment?.value ?? '');
  const [confirmRemove, setConfirmRemove] = useState(false);

  const clean = normalizeName(name);
  const duplicate = clean ? findDuplicate(event.people, clean, person?.id) : undefined;
  const nameError = duplicate ? `Someone named ${duplicate.name} is already here` : null;
  const valid = clean.length > 0 && !duplicate;
  const usage = person ? personUsage(event, person.id) : null;
  const inUse = usage ? usage.expenses + usage.payments : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const payment = method && value.trim() ? { method, value: value.trim() } : undefined;
    if (person) {
      updatePerson(event.id, person.id, { name: clean, ...avatar, payment });
    } else {
      const id = addPerson(event.id, { name: clean, ...avatar });
      if (id && payment) updatePerson(event.id, id, { payment });
    }
    onDone();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <TextField
        label="Name"
        value={name}
        maxLength={LIMITS.personName}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        autoComplete="off"
        data-autofocus
      />
      <AvatarPicker emoji={avatar.emoji} color={avatar.color} onChange={setAvatar} />
      <div className="flex flex-col gap-2">
        <label htmlFor="pay-method" className="text-label font-bold">
          Payment handle <span className="font-semibold text-ink-muted">(optional)</span>
        </label>
        <select
          id="pay-method"
          className={`${inputClass} w-full`}
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod | '')}
        >
          <option value="">None</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {method && (
          <TextField
            label={`${method} number or account`}
            hideLabel
            placeholder={method === 'Bank' ? 'Bank + account number' : '0917 123 4567'}
            value={value}
            maxLength={LIMITS.paymentValue}
            onChange={(e) => setValue(e.target.value)}
            hint="Only shared with people you send the link to."
          />
        )}
      </div>
      <Button type="submit" block disabled={!valid}>
        Save
      </Button>
      {person && (
        <>
          {inUse > 0 ? (
            <p className="rounded-2xl bg-cream p-3 text-caption text-ink-muted" role="note">
              {person.name} is part of{' '}
              {usage?.expenses ? `${usage.expenses} expense${usage.expenses === 1 ? '' : 's'}` : ''}
              {usage?.expenses && usage.payments ? ' and ' : ''}
              {usage?.payments ? `${usage.payments} payment${usage.payments === 1 ? '' : 's'}` : ''}
              . Remove them from those first.
            </p>
          ) : (
            event.people.length > 1 && (
              <Button variant="danger" block onClick={() => setConfirmRemove(true)}>
                Remove {person.name}
              </Button>
            )
          )}
          <ConfirmDialog
            open={confirmRemove}
            title={`Remove ${person.name}?`}
            confirmLabel="Remove"
            confirmVariant="danger-solid"
            onCancel={() => setConfirmRemove(false)}
            onConfirm={() => {
              setConfirmRemove(false);
              if (removePerson(event.id, person.id).ok) onDone();
            }}
          />
        </>
      )}
    </form>
  );
}
