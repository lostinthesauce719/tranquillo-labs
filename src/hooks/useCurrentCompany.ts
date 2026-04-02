'use client';

import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Hook to get the current user's company and membership.
 * Looks up memberships by clerkUserId, picks the first active one,
 * then fetches the associated company record.
 */
export function useCurrentCompany() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const clerkUserId = user?.id;

  // Find all memberships for this clerk user
  // We query all memberships and filter client-side since there's
  // no direct "by_clerkUserId across all companies" query available
  // In production, you'd have a dedicated query for this.
  const allMemberships = useQuery(
    api.memberships.getMembers,
    // This requires companyId - we'll work around by storing companyId in URL/localStorage
    // For now, skip until we have the context
    'skip'
  );

  // For the MVP, we store the selected companyId in localStorage
  // and provide it via this hook. Pages can also accept it as a prop.
  const storedCompanyId = typeof window !== 'undefined'
    ? localStorage.getItem('tranquillo_companyId')
    : null;

  const companyId = storedCompanyId as Id<'companies'> | null;

  const company = useQuery(
    api.companies.getCompany,
    companyId ? { companyId } : 'skip'
  );

  const members = useQuery(
    api.memberships.getMembers,
    companyId ? { companyId } : 'skip'
  );

  const membership = members?.find(
    (m: any) => m.clerkUserId === clerkUserId
  ) ?? null;

  return {
    company: company ?? null,
    companyId,
    membership,
    isLoading: !isClerkLoaded || (companyId ? company === undefined : false),
  };
}
